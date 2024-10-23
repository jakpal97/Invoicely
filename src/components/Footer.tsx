import Container from '@/components/container'

const Footer = () => {
	return (
		<footer className="mt-12 mb-8 font-semibold">
			<Container className='flex justify-between gap-4'>
				<p className="text-sm">Invoicly &copy; {new Date().getFullYear()} </p>
                <p className="text-sm">Created by Jakub Palka with Next.js</p>
			</Container>
		</footer>
	)
}

export default Footer
