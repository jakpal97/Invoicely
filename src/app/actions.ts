'use server'

import { Invoices, Customers, Status } from '@/db/schema'
import { db } from '@/db'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { eq, and, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_API_KEY_SECRET as string)

export async function createAction(formData: FormData) {
	const { userId, orgId } = await auth()
	if (!userId) {
		console.log('No user authenticated')
		return
	}

	const value = Math.floor(parseFloat(String(formData.get('value')))) * 100
	const description = formData.get('description') as string
	const name = formData.get('name') as string
	const email = formData.get('email') as string

	const [customer] = await db
		.insert(Customers)
		.values({
			name,
			email,
			userId,
			organizationId: orgId || null,
		})
		.returning({
			id: Customers.id,
		})

	const results = await db
		.insert(Invoices)
		.values({
			value,
			description,
			userId,
			customerId: customer.id,
			status: 'open',
			organizationId: orgId || null,
		})
		.returning({
			id: Invoices.id,
		})
	redirect(`/invoices/${results[0].id}`)
}


export async function updateStatusAction(formData: FormData) {
	const { userId, orgId } = await auth()


	if (!userId) {
		return
	}

	const id = formData.get('id') as string
	const status = formData.get('status') as Status

	if (orgId) {
		await db
			.update(Invoices)
			.set({ status })
			.where(and(eq(Invoices.id, Number.parseInt(id)), eq(Invoices.organizationId, orgId)))
	} else {
		await db
			.update(Invoices)
			.set({ status })
			.where(and(eq(Invoices.id, Number.parseInt(id)), eq(Invoices.userId, userId), isNull(Invoices.organizationId)))
	}

	// revalidatePath(`/invoices/${id}`, 'page')
}
export async function updateStatusInvoice(formData: FormData) {
	const { userId, orgId } = await auth()


	if (!userId) {
		return
	}

	const id = formData.get('id') as string
	const status = formData.get('status') as Status

	if (orgId) {
		await db
			.update(Invoices)
			.set({ status })
			.where(and(eq(Invoices.id, Number.parseInt(id)), eq(Invoices.organizationId, orgId)))
	} else {
		await db
			.update(Invoices)
			.set({ status })
			.where(and(eq(Invoices.id, Number.parseInt(id)), eq(Invoices.userId, userId), isNull(Invoices.organizationId)))
	}

	revalidatePath(`/invoices/${id}`, 'page')
}


export async function deleteInvoiceAction(formData: FormData) {
	const { userId } = await auth()
	if (!userId) return

	const id = formData.get('id') as string

	await db.delete(Invoices).where(and(eq(Invoices.id, parseInt(id)), eq(Invoices.userId, userId)))
	redirect('/dashboard')
}

export async function CreatePayment(formData: FormData) {
	const headersList = headers()
	const origin = (await headersList).get('origin')
	const id = parseInt(formData.get('id') as string)

	const [result] = await db
		.select({
			status: Invoices.status,
			value: Invoices.value,
		})
		.from(Invoices)
		.where(eq(Invoices.id, id))
		.limit(1)

	const session = await stripe.checkout.sessions.create({
		line_items: [
			{
				price_data: {
					currency: 'PLN',
					product: 'prod_RD5O8ZmokA2rVT',
					unit_amount: result.value,
				},
				quantity: 1,
			},
		],
		mode: 'payment',
		success_url: `${origin}/invoices/${id}/payment?status=success&session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${origin}/invoices/${id}/payment?status=canceled&session_id={CHECKOUT_SESSION_ID}`,
	})

	if (!session.url) {
		throw new Error('Invalid Session Url')
	}
	redirect(session.url)
}
