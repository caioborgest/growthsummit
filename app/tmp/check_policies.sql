DO $$
DECLARE r RECORD;
BEGIN FOR r IN (
    SELECT polname,
        tablename
    FROM pg_policies
    WHERE schemaname = 'public'
        AND tablename = 'rodada_negocios_b2b' -- AND permissive = 'NO' -- No Postgres, isso é polpermissive = false
) LOOP -- RAISE NOTICE 'Checking policy % on table %', r.polname, r.tablename;
END LOOP;
END $$;