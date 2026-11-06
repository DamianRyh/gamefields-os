import {integer,sqliteTable,text,index} from 'drizzle-orm/sqlite-core';
/** Additive P2 table. Historical application tables remain in their frozen migration ledger. */
export const studioSharedProjects=sqliteTable('studio_shared_projects',{
 id:text('id').primaryKey(),projectJson:text('project_json').notNull(),modelRevision:text('model_revision'),readHash:text('read_hash').notNull(),deleteHash:text('delete_hash').notNull(),createdAt:integer('created_at').notNull(),expiresAt:integer('expires_at').notNull(),revokedAt:integer('revoked_at'),submitterHash:text('submitter_hash').notNull(),
},table=>[index('studio_shared_submitter_idx').on(table.submitterHash,table.createdAt)]);
export const studioCrewRequests=sqliteTable('studio_crew_requests',{
 id:text('id').primaryKey(),submitterHash:text('submitter_hash').notNull(),createdAt:integer('created_at').notNull(),
},table=>[index('studio_crew_requests_submitter_idx').on(table.submitterHash,table.createdAt)]);
