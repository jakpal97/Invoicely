import { Button } from '@/components/ui/button'
import Link from 'next/link'


export default function Home() {
	return (
		<main className="flex flex-col justify-center items-center h-screen text-center gap-6 max-w-5xl mx-auto">
			
			<h1 className="text-7xl font-bold ">Invoicely</h1>
			<p>
				
				<Button className="h-10 rounded-md px-8" asChild>
					<Link href="/dashboard">Sign In</Link>
				</Button>
			</p>
		</main>
	)
}
