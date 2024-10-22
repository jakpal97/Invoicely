'use client'

import { SyntheticEvent, useState } from 'react'
import Form from 'next/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import SubmitButton from '@/components/SubmitButton'

import { createAction } from '@/actions'

export default function Dashboard() {
	const [state, setState] = useState('ready')

	async function handleOnSubmit(event: SyntheticEvent) {
		event.preventDefault()
		if (state === 'pending') {
			event.preventDefault()
			return
		}
		setState('pending')
	}

	return (
		<main className="flex flex-col justify-center h-full gap-6 max-w-5xl mx-auto my-12">
			<div className="flex justify-between">
				<h1 className="text-3xl font-semibold ">Create Invoice</h1>
			</div>
			<Form action={createAction} onSubmit={handleOnSubmit} className="grid gap-5 max-w-xs">
				<div>
					<Label htmlFor="name" className="block mb-2 font-semibold ">
						Billing name
					</Label>
					<Input name="name" id="name" type="text"></Input>
				</div>
				<div>
					<Label htmlFor="email" className="block mb-2 font-semibold ">
						Billing email
					</Label>
					<Input name="email" id="email" type="email"></Input>
				</div>
				<div>
					<Label htmlFor="value" className="block mb-2 font-semibold ">
						Value
					</Label>
					<Input name="value" id="value" type="text"></Input>
				</div>
				<div>
					<Label htmlFor="description" className="block mb-2 font-semibold">
						Description
					</Label>
					<Textarea id="description" name="description"></Textarea>
				</div>
				<div>
					<SubmitButton />
				</div>
			</Form>
		</main>
	)
}
