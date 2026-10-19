import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const accessCodes = sqliteTable('access_codes', {
 id: text('id').primaryKey(), label: text('label').notNull(),
 hash: text('hash').notNull().unique(), expires: integer('expires').notNull(),
 singleUse: integer('single_use').notNull().default(0), sessionHash: text('session_hash'), activated: integer('activated'),
 revoked: integer('revoked').notNull().default(0), created: integer('created').notNull()
});

export const orders = sqliteTable('orders', {
 id: integer('id').primaryKey(), ownerHash: text('owner_hash').notNull().unique(),
 amount: integer('amount').notNull(), status: text('status').notNull(),
 paymentAccount: text('payment_account'), linkId: text('link_id').unique(), checkoutUrl: text('checkout_url'),
 codeCipher: text('code_cipher').notNull(), codeHash: text('code_hash').notNull().unique(),
 created: integer('created').notNull(), checked: integer('checked').notNull().default(0),
 paid: integer('paid'),
});
