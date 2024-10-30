import { pgEnum, integer, pgTable, serial, timestamp, text } from 'drizzle-orm/pg-core'

import AVAILABLE_STATUS from '@/data/invoices'

export type Status = (typeof AVAILABLE_STATUS)[number]['id']
const statuses = AVAILABLE_STATUS.map(({ id }) => id) as Array<Status>

export const statusEnum = pgEnum('status', statuses as [Status, ...Array<Status>])

export const Invoices = pgTable('invoices', {
	id: serial('id').primaryKey().notNull(),
	createTs: timestamp('createTs').defaultNow().notNull(),
	value: integer('value').notNull(),
	description: text('description').notNull(),
	userId: text('userId').notNull(),
	organizationId: text('organizationId'),
	customerId: integer('customerId')
		.notNull()
		.references(() => Customers.id),
	status: statusEnum('status').notNull(),
})

export const Customers = pgTable('customers', {
	id: serial('id').primaryKey().notNull(),
	createTs: timestamp('createTs').defaultNow().notNull(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	userId: text('userId').notNull(),
	organizationId: text('organizationId'),
})
