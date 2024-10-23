import { SignUp } from '@clerk/nextjs'
import Container from '@/components/container'

export default function Page() {
	return (
		<Container className='flex justify-center items-center'>
			<SignUp />
		</Container>
	)
}
