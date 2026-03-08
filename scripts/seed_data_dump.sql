--
-- PostgreSQL database dump
--

\restrict ZS7DQYnomAIeioOo0zGIztrYFIXE7nXr8XMtpNSv8zt9ve5OTfdBkEeHT6fgmlq

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: admin_expense_group_master; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.admin_expense_group_master VALUES ('088cea29-2e67-4302-abc7-c909ee3c0dae', 'AI Tools', '2026-02-14 08:40:17.509', '2026-02-14 08:40:17.509');
INSERT INTO public.admin_expense_group_master VALUES ('c98d7a96-7400-45fa-a467-d052858adf1f', 'Instrastrcutures', '2026-02-14 08:40:26.745', '2026-02-14 08:40:26.745');
INSERT INTO public.admin_expense_group_master VALUES ('224a944d-6e15-4074-9e31-1a876c906b1f', 'Marketings', '2026-02-14 08:40:35.073', '2026-02-14 08:40:35.073');
INSERT INTO public.admin_expense_group_master VALUES ('436c0bee-e669-4b71-954b-ef6a5310745d', 'Salary', '2026-02-14 08:40:44.778', '2026-02-14 08:40:44.778');
INSERT INTO public.admin_expense_group_master VALUES ('582d03b0-9e7a-4e74-b512-9031d5304a03', 'Foods & Tea', '2026-02-14 08:42:23.231', '2026-02-14 08:42:23.231');


--
-- Data for Name: enquirytypemaster; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.enquirytypemaster VALUES ('096ebf92-770a-4671-8a96-f279a494a2a7', 'Telephonic', true, '2026-01-01 11:06:22.337', '2026-01-01 11:06:22.337', '201b7189-a17d-4d55-a467-18e3f7130022');
INSERT INTO public.enquirytypemaster VALUES ('6880e56f-eb5b-4b01-a7d2-97af87cddf6f', 'Others', true, '2026-01-01 11:06:34.776', '2026-01-01 11:06:34.776', '201b7189-a17d-4d55-a467-18e3f7130022');
INSERT INTO public.enquirytypemaster VALUES ('da78fe4d-4b88-4c15-b23d-e6b9dbe48224', 'Walkin', true, '2026-01-01 11:06:30.345', '2026-02-05 07:12:44.033', '201b7189-a17d-4d55-a467-18e3f7130022');


--
-- PostgreSQL database dump complete
--

\unrestrict ZS7DQYnomAIeioOo0zGIztrYFIXE7nXr8XMtpNSv8zt9ve5OTfdBkEeHT6fgmlq

