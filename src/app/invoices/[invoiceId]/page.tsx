import { notFound } from 'next/navigation'
import Link from 'next/link'
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
import { updateStatusInvoice, deleteInvoiceAction } from '@/app/actions'
import { ChevronDown, CreditCard, Ellipsis, Trash } from 'lucide-react'

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
					<div className="flex gap-4">
						<DropdownMenu>
							<DropdownMenuTrigger asChild className="flex items-center gap-2">
								<Button variant="outline">
									Change Status <ChevronDown className="w-4 h-auto" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{AVAILABLE_STATUS.map(status => {
									return (
										<DropdownMenuItem key={status.id}>
											<form action={updateStatusInvoice}>
												<input type="hidden" name="id" value={invoiceId} />
												<input type="hidden" name="status" value={status.id} />
												<button>{status.label}</button>
											</form>
										</DropdownMenuItem>
									)
								})}
							</DropdownMenuContent>
						</DropdownMenu>
						<Dialog>
							<DropdownMenu>
								<DropdownMenuTrigger asChild className="flex items-center gap-2">
									<Button variant="outline">
										<span className="sr-only">More Options</span>
										<Ellipsis className="w-4 h-auto" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem>
										<DialogTrigger asChild>
											<button className="flex items-center gap-2">
												<Trash className="w-4 h-auto" />
												Delete Invoice
											</button>
										</DialogTrigger>
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Link href={`/invoices/${invoiceId}/payment`} className="flex items-center gap-2">
											<CreditCard className="w-4 h-auto" />
											Payment
										</Link>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<DialogContent className="bg-white">
								<DialogHeader>
									<DialogTitle className="text-2xl">Are you absolutely sure?</DialogTitle>
									<DialogDescription>
										This action cannot be undone. This will permanently delete your invoice and remove your data from
										our server.
									</DialogDescription>
									<DialogFooter>
										<form className="flex justify-center" action={deleteInvoiceAction}>
											<input type="hidden" name="id" value={invoiceId} />
											<Button variant="destructive" className="flex items-center gap-2">
												<Trash className="w-4 h-auto" />
												Delete Invoice
											</Button>
										</form>
									</DialogFooter>
								</DialogHeader>
							</DialogContent>
						</Dialog>
					</div>
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
