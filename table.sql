CREATE TABLE IF NOT EXISTS public.auth
(
  username character varying(255) COLLATE pg_catalog."default" NOT NULL,
  key json,
  CONSTRAINT auth_pkey PRIMARY KEY (username)
)
WITH (
  OIDS = FALSE
);
