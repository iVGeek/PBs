CREATE TABLE "bibs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"bib_number" text NOT NULL,
	"event_name" text NOT NULL,
	"event_date" timestamp NOT NULL,
	"distance" text,
	"photo_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"race_name" text NOT NULL,
	"event_date" timestamp NOT NULL,
	"distance" text NOT NULL,
	"time_seconds" integer NOT NULL,
	"place" integer,
	"photo_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"strava_id" text,
	"strava_access_token" text,
	"strava_refresh_token" text,
	"strava_token_expires_at" timestamp with time zone,
	"name" text DEFAULT '' NOT NULL,
	"email" text,
	"avatar" text,
	"bio" text DEFAULT '',
	"units" text DEFAULT 'km' NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"onboarding_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_strava_id_unique" UNIQUE("strava_id")
);
--> statement-breakpoint
ALTER TABLE "bibs" ADD CONSTRAINT "bibs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medals" ADD CONSTRAINT "medals_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;