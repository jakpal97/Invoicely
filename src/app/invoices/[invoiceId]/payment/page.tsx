import { notFound } from 'next/navigation'
import { eq, and, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { Invoices, Customers } from '@/db/schema'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { auth } from '@clerk/nextjs/server'
import Container from '@/components/container'
import AVAILABLE_STATUS from '@/data/invoices'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { updateStatusAction, deleteInvoiceAction } from '@/app/actions'
import { ChevronDown, Ellipsis, Trash } from 'lucide-react'

export default async function InvoicePage({ params }: { params: { invoiceId: string } }) {
	const { userId, orgId } = await auth()

	if (!userId) return

	const { invoiceId: invoiceIdParam } = await params
	const invoiceId = parseInt(invoiceIdParam)

	if (isNaN(invoiceId)) {
		throw new Error('Invalid ID')
	}
	let result
	if (orgId) {
		;[result] = await db
			.select()
			.from(Invoices)
			.innerJoin(Customers, eq(Invoices.customerId, Customers.id))
			.where(and(eq(Invoices.id, invoiceId), eq(Invoices.organizationId, orgId)))
			.limit(1)
	} else {
		;[result] = await db
			.select()
			.from(Invoices)
			.innerJoin(Customers, eq(Invoices.customerId, Customers.id))
			.where(and(eq(Invoices.id, invoiceId), eq(Invoices.userId, userId), isNull(Invoices.organizationId)))
			.limit(1)
	}

	console.log('result', result)

	if (!result) {
		notFound()
	}
	const invoice = {
		...result.invoices,
		customer: result.customers,
	}

	return (
		<main className="w-full h-full ">
			<Container>
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
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">Billing Email</strong>
						<span>{invoice.customer.email}</span>
					</li>
				</ul>
			</Container>
		</main>
	)
}
