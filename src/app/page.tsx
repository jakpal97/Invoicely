import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Container from '@/components/container'

export default function Home() {
	return (
	
		<Container className="flex flex-col justify-center items-center">
			<h1 className="text-7xl font-bold ">Invoicely</h1>
			<p>
				<Button className="h-10 rounded-md px-8" asChild>
					<Link href="/dashboard">Sign In</Link>
				</Button>
			</p>
		</Container>
		
	)
}
