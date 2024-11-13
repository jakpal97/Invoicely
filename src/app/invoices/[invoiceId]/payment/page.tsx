import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { Invoices, Customers } from '@/db/schema'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Stripe from 'stripe'

import Container from '@/components/container'
import { Button } from '@/components/ui/button'
import { CreditCard, Check } from 'lucide-react'
import { CreatePayment, updateStatusAction } from '@/app/actions'

const stripe = new Stripe(process.env.STRIPE_API_KEY_SECRET as string)
interface InvoicePageProps {
	params: { invoiceId: string }
	searchParams: {
		status: string
		session_id: string
	}
}

export default async function InvoicePage({ params, searchParams }: InvoicePageProps) {
	const invoiceId = Number(params.invoiceId)
	const sessionId = searchParams?.session_id
	const isSuccess = sessionId && searchParams.status === 'success'
	const isCanceled = searchParams.status === 'canceled'
	let isErorr = isSuccess && !sessionId

	if (isSuccess) {
		const { payment_status } = await stripe.checkout.sessions.retrieve(sessionId)
		if (payment_status !== 'paid') {
			isErorr = true
		} else {
			const formData = new FormData()
			formData.append('id', String(invoiceId))
			formData.append('status', 'paid')
			await updateStatusAction(formData)
		}
	}

	const [result] = await db
		.select({
			id: Invoices.id,
			status: Invoices.status,
			createTs: Invoices.createTs,
			description: Invoices.description,
			value: Invoices.value,
			name: Customers.name,
		})
		.from(Invoices)
		.innerJoin(Customers, eq(Invoices.customerId, Customers.id))
		.where(eq(Invoices.id, invoiceId))
		.limit(1)

	if (!result) {
		notFound()
	}

	const invoice = {
		...result,
		customer: {
			name: result.name,
		},
	}



	return (
		<main className="w-full h-full ">
			<Container>
				{isErorr && (
					<p className="bg-red-120 text-sm text-red-800 text-center px-3 py-2 rounded-lg mb-6">
						{' '}
						Something went wrong !!{' '}
					</p>
				)}
				{isCanceled && (
					<p className="bg-yellow-120 text-sm text-red-800 text-center px-3 py-2 rounded-lg mb-6">
						{' '}
						Payment was canceled please try again !{' '}
					</p>
				)}
				<div className="grid grid-cols-2">
					<div>
						<div className="flex justify-between mb-8">
							<h1 className=" flex items-center gap-4 text-3xl font-semibold">
								Invoice {invoiceId}{' '}
								<Badge
									className={cn(
										'rounded-full capitalize',
										invoice.status === 'open' && 'bg-blue-500',
										invoice.status === 'paid' && 'bg-green-600',
										invoice.status === 'void' && 'bg-zinc-700'
									)}>
									{invoice.status}
								</Badge>
							</h1>
						</div>
						<p className="text-3xl mb-3">{(invoice.value / 100).toFixed(2)}PLN</p>

						<p className="text-lg mb-8">{invoice.description}</p>
					</div>
					<div>
						<h2 className="text-2xl font-bold mb-4">Payment Method</h2>
						{invoice.status === 'open' && (
							<form action={CreatePayment}>
								<input type="hidden" name="id" value={invoice.id} />
								<Button className="flex gap-2 font-bold bg-purple-700">
									<CreditCard className="w-5 h-auto" />
									Make payment
								</Button>
							</form>
						)}
						{invoice.status === 'paid' && (
							<p className="flex gap-2 items-center text-xl font-bold">
								{' '}
								<Check className="w-8 h-auto- bg-green-600 rounded-full text-white p-1" />
								Invoice Paid
							</p>
						)}
					</div>
				</div>

				<h2 className="font-bold text-lg mb-4">Billing Details</h2>

				<ul className="grid gap-2">
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">Invoice ID</strong>
						<span>{invoiceId}</span>
					</li>
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">Invoice Date</strong>
						<span>{new Date(invoice.createTs).toLocaleDateString()}</span>
					</li>
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">Billing Name</strong>
						<span>{invoice.customer.name}</span>
					</li>
				</ul>
			</Container>
		</main>
	)
}
