import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const progress = sqliteTable('learning_progress', {
 userId:text('user_id').notNull(), lessonId:text('lesson_id').notNull(), version:text('version').notNull(),
 score:integer('score').notNull(), completed:integer('completed',{mode:'boolean'}).notNull().default(false),
 updatedAt:text('updated_at').notNull()
},t=>[primaryKey({columns:[t.userId,t.lessonId,t.version]})]);
export const attendance = sqliteTable('training_attendance', {
 id:text('id').primaryKey(), memberId:text('member_id').notNull(), lessonId:text('lesson_id').notNull(), version:text('version').notNull(),
 sessionDate:text('session_date').notNull(), liveMinutes:integer('live_minutes').notNull(), prepMinutes:integer('prep_minutes').notNull(),
 recordedBy:text('recorded_by').notNull(), recordedAt:text('recorded_at').notNull(), voidedAt:text('voided_at')
});

export const authUsers=sqliteTable('users',{id:text('id').primaryKey(),name:text('name'),email:text('email'),emailVerified:text('emailVerified'),image:text('image')},t=>[uniqueIndex('auth_users_email').on(t.email)]);
export const authAccounts=sqliteTable('accounts',{id:text('id').primaryKey(),userId:text('userId').notNull(),type:text('type').notNull(),provider:text('provider').notNull(),providerAccountId:text('providerAccountId').notNull(),refresh_token:text('refresh_token'),access_token:text('access_token'),expires_at:integer('expires_at'),token_type:text('token_type'),scope:text('scope'),id_token:text('id_token'),session_state:text('session_state'),oauth_token_secret:text('oauth_token_secret'),oauth_token:text('oauth_token')},t=>[uniqueIndex('auth_provider_identity').on(t.provider,t.providerAccountId)]);
export const authSessions=sqliteTable('sessions',{id:text('id').notNull(),sessionToken:text('sessionToken').primaryKey(),userId:text('userId').notNull(),expires:text('expires').notNull()});
export const authVerification=sqliteTable('verification_tokens',{identifier:text('identifier').notNull(),token:text('token').primaryKey(),expires:text('expires').notNull()});

// Separate from board practice/attendance; pilot self-study never awards approved credit.
export const selfPacedProgress=sqliteTable('self_paced_progress',{
 userId:text('user_id').notNull(),lessonId:text('lesson_id').notNull(),version:text('version').notNull(),
 state:text('state').notNull(),completed:integer('completed',{mode:'boolean'}).notNull().default(false),updatedAt:text('updated_at').notNull()
},t=>[primaryKey({columns:[t.userId,t.lessonId,t.version]})]);

// Contribution records intentionally have no foreign keys to learner accounts.
export const contributions = sqliteTable('course_suggestions', {
  id: text('id').primaryKey().notNull(),
  lessonId: text('lesson_id').notNull(),
  edition: text('edition').notNull(),
  track: text('track').notNull(),
  issue: text('issue').notNull(),
  proposal: text('proposal').notNull(),
  source: text('source').notNull(),
  displayName: text('display_name').notNull(),
  contact: text('private_contact').notNull(),
  status: text('status').notNull().default('received'),
  publicNote: text('public_note').notNull().default(''),
  visible: integer('visible').notNull().default(0),
  createdAt: text('created_at').notNull(),
  revision: integer('revision').notNull().default(0),
  actionId: text('action_id'),
  approvedText: text('approved_text'),
  approvedAt: text('approved_at'),
  publishedEdition: text('published_edition'),
  publishedAt: text('published_at'),
}, t => [index('course_suggestions_public').on(t.visible, t.createdAt)]);

export const contributionComments = sqliteTable('course_suggestion_comments', {
  id: text('id').primaryKey().notNull(),
  suggestionId: text('suggestion_id').notNull().references(() => contributions.id),
  body: text('body').notNull(),
  displayName: text('display_name').notNull(),
  moderation: text('moderation').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  revision: integer('revision').notNull().default(0),
  actionId: text('action_id'),
}, t => [index('course_suggestion_comments_parent').on(t.suggestionId, t.moderation, t.createdAt)]);

export const contributionAudit = sqliteTable('course_suggestion_audit', {
  id: text('id').primaryKey().notNull(),
  suggestionId: text('suggestion_id').notNull().references(() => contributions.id),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull(),
  createdAt: text('created_at').notNull(),
}, t => [index('course_suggestion_audit_parent').on(t.suggestionId, t.createdAt)]);

export const contributionLimits = sqliteTable('course_contribution_limits', {
  bucket: integer('bucket').notNull(),
  clientKey: text('client_key').notNull(),
  hits: integer('hits').notNull(),
}, t => [primaryKey({columns: [t.bucket, t.clientKey]})]);
