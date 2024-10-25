import { notFound } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { Invoices } from '@/db/schema'
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
	const { userId } = await auth()

	if (!userId) return

	const invoiceId = parseInt(params.invoiceId)

	if (isNaN(invoiceId)) {
		throw new Error('Invalid ID')
	}

	const [result] = await db
		.select()
		.from(Invoices)
		.where(and(eq(Invoices.id, invoiceId), eq(Invoices.userId, userId)))
		.limit(1)

	if (!result) {
		notFound()
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
								result.status === 'open' && 'bg-blue-500',
								result.status === 'paid' && 'bg-green-600',
								result.status === 'void' && 'bg-zinc-700'
							)}>
							{result.status}
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
											<form action={updateStatusAction}>
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
				<p className="text-3xl mb-3">{(result.value / 100).toFixed(2)}PLN</p>

				<p className="text-lg mb-8">{result.description}</p>

				<h2 className="font-bold text-lg mb-4">Billing Details</h2>

				<ul className="grid gap-2">
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">Invoice ID</strong>
						<span>{invoiceId}</span>
					</li>
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">Invoice Date</strong>
						<span>{new Date(result.createTs).toLocaleDateString()}</span>
					</li>
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">Billing Name</strong>
						<span></span>
					</li>
					<li className="flex gap-4">
						<strong className="block w-28 flex-shrink-0 font-medium text-sm">Billing Email</strong>
						<span></span>
					</li>
				</ul>
			</Container>
		</main>
	)
}
