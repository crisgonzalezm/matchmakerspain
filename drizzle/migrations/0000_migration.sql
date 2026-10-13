CREATE TABLE public.influencers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  handle text NOT NULL,
  platform text NOT NULL,
  main_niche text NOT NULL,
  secondary_niches text[] NOT NULL DEFAULT '{}',
  city text NOT NULL DEFAULT '',
  followers integer NOT NULL DEFAULT 0,
  engagement numeric(5,2) NOT NULL DEFAULT 0,
  audience_female_pct integer NOT NULL DEFAULT 50,
  audience_age text NOT NULL DEFAULT '25-34',
  audience_country text NOT NULL DEFAULT 'España',
  values text[] NOT NULL DEFAULT '{}',
  tone text NOT NULL DEFAULT 'cercano',
  collaborations text[] NOT NULL DEFAULT '{}',
  fee integer NOT NULL DEFAULT 0,
  alert text,
  bio text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencers TO anon, authenticated;
GRANT ALL ON public.influencers TO service_role;
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.influencers FOR SELECT USING (true);
CREATE POLICY "public insert" ON public.influencers FOR INSERT WITH CHECK (true);
CREATE POLICY "public update" ON public.influencers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete" ON public.influencers FOR DELETE USING (true);

INSERT INTO public.influencers (name,handle,platform,main_niche,secondary_niches,city,followers,engagement,audience_female_pct,audience_age,audience_country,values,tone,collaborations,fee,alert,bio) VALUES
('Lucía Arbeloa','@luciaenverde','Instagram','sostenibilidad','{lifestyle,decoración}','Valencia',28400,5.8,82,'25-34','España','{sostenibilidad,"vida sana"}','cercano','{Hojarasca Cosmética,Verdel Textil}',350,NULL,'Vive en una casa de huerta y comparte trucos de residuo cero. Defiende el consumo local y la moda de segunda mano.'),
('Marcos Ledesma','@marcosfogones','TikTok','gastronomía','{viajes}','Bilbao',412000,7.4,48,'18-24','España','{humor,familia}','divertido','{Salsas Cantábrico,Mercadal Foods,Panadería Ovillo}',2800,NULL,'Cocinero aficionado que convierte recetas de su abuela en vídeos virales. Humor norteño y mucho producto local.'),
('Irene Castañar','@irenecastanar','Instagram','moda','{belleza,lifestyle}','Madrid',685000,2.1,88,'25-34','España','{lujo}','aspiracional','{Maison Ardelle,Joyería Brumal,Velluto}',6500,'Polémica con una marca competidora (Velluto vs. Sastrería Nébula) en 2025 por publicar contenido de ambas en la misma semana.','Estilista y editora de moda. Looks de inspiración parisina y viajes a semanas de la moda.'),
('Nerea Olabide','@nereaentrena','YouTube','fitness','{"lifestyle"}','San Sebastián',156000,4.3,71,'25-34','España','{"vida sana","body positive"}','experto','{Pulso Sport,Avena Norte}',1600,NULL,'Entrenadora personal titulada. Rutinas en casa, nutrición sin dietas milagro y mucha divulgación.'),
('Pablo Rioseco','@pablorumbo','YouTube','viajes','{gastronomía}','Sevilla',324000,3.6,42,'25-34','España','{aventura,sostenibilidad}','aspiracional','{Mochilas Ébano,Aerolíneas Sirocco,Hostales Brisa}',3900,NULL,'Documentales de viaje de bajo presupuesto por rutas poco conocidas. Narrativa cuidada y fotografía espectacular.'),
('Carmen Ubeda','@mamaubeda','Instagram','maternidad','{lifestyle,decoración}','Málaga',92000,6.2,94,'25-34','España','{familia,humor}','cercano','{Pañales Nido,Juguetes Trébol}',900,NULL,'Madre de tres que cuenta la crianza sin filtros. Humor, rutinas reales y mucha comunidad.'),
('Sara Villalón','@saravillalon.home','Instagram','decoración','{lifestyle,sostenibilidad}','Barcelona',211000,3.9,86,'35-44','España','{sostenibilidad,"hecho a mano"}','aspiracional','{Cerámica Aljibe,Lino & Roble,Pinturas Marea}',2100,NULL,'Interiorista que reforma pisos antiguos del Eixample. Estilo mediterráneo, materiales naturales y DIY.'),
('Daniela Fuster','@danibeauty','TikTok','belleza','{moda}','Madrid',890000,8.9,91,'18-24','España','{"body positive",humor}','divertido','{Glowra Cosmetics,Pestañas Lince,Brillo Labs}',7200,'Audiencia con posibles seguidores falsos: picos inusuales de crecimiento detectados en 2025.','Tutoriales de maquillaje rápidos con mucho humor. Reseñas sinceras de productos low cost.'),
('Hugo Barrenechea','@hugofit','Instagram','fitness','{gastronomía}','Vitoria',38500,6.7,39,'25-34','España','{"vida sana",superación}','experto','{Proteínas Alce}',450,NULL,'Fisioterapeuta y corredor de montaña. Consejos de prevención de lesiones y recetas proteicas.'),
('Alba Sorní','@albasorni','Instagram','lifestyle','{moda,viajes}','Valencia',134000,4.1,84,'25-34','España','{lujo,"vida sana"}','aspiracional','{Hoteles Azahar,Gafas Solano}',1500,NULL,'Vida entre Valencia y la costa: escapadas, brunch y moda de temporada con una estética luminosa.'),
('Javier Montoro','@javicocinalento','YouTube','gastronomía','{sostenibilidad}','Córdoba',67000,5.1,55,'35-44','España','{sostenibilidad,tradición}','experto','{Aceites Olivar Alto,Ollas Fénix}',800,NULL,'Chef formado en cocina tradicional andaluza. Explica técnicas clásicas y producto de temporada.'),
('Inés Lafuente','@ineslafuente','TikTok','moda','{sostenibilidad}','Zaragoza',47000,9.2,89,'18-24','España','{sostenibilidad,"body positive"}','cercano','{Vintage Ráfaga}',400,NULL,'Estudiante de diseño que transforma ropa de segunda mano. Hauls de mercadillo y costura fácil.'),
('Óscar Peñalver','@oscarviajaenfamilia','Instagram','viajes','{maternidad,lifestyle}','Murcia',178000,3.4,68,'35-44','España','{familia,aventura}','cercano','{Caravanas Delta,Parques Lumen,Maletas Cirro}',1900,NULL,'Padre viajero que recorre Europa en caravana con sus dos hijas. Planes familiares y logística real.'),
('Elena Garrigós','@elenaskin','Instagram','belleza','{"vida sana"}','Alicante',255000,2.8,93,'25-34','España','{"vida sana",ciencia}','experto','{Dermalía,Sérum Atlas}',2600,'Publicó una afirmación sanitaria sin respaldo científico sobre un suplemento en 2024; retiró el post tras críticas.','Farmacéutica especializada en dermocosmética. Desmonta mitos de skincare con rigor.'),
('Rubén Costal','@rubencostal','YouTube','lifestyle','{humor}','A Coruña',1250000,4.8,44,'18-24','España','{humor}','divertido','{Refrescos Ola,Auriculares Kilo,Gaming Nébula}',12000,'Investigado en 2025 por publicidad encubierta no señalizada en varios vídeos.','Creador de sketches y retos virales. Uno de los canales de entretenimiento más vistos del noroeste.'),
('Paula Echarri','@paulayogui','Instagram','fitness','{"lifestyle",sostenibilidad}','Pamplona',22800,7.9,90,'25-34','España','{"vida sana",mindfulness}','cercano','{Esterillas Sauce}',280,NULL,'Profesora de yoga que comparte prácticas cortas y reflexiones sobre bienestar emocional.'),
('Tomás Iriarte','@tomasdeco','TikTok','decoración','{lifestyle}','Madrid',98000,8.1,63,'25-34','España','{"hecho a mano",humor}','divertido','{Ferretería Cobalto,Muebles Ápice}',950,NULL,'Transforma pisos de alquiler con poco presupuesto. Antes/después rápidos y mucha chispa.'),
('Begoña Ruano','@begorecetas','Instagram','gastronomía','{maternidad,familia}','Valladolid',143000,4.6,87,'35-44','España','{familia,"vida sana"}','cercano','{Harinas Molino Real,Lácteos Prado}',1400,NULL,'Recetas fáciles para toda la familia y meal prep semanal. Cocina de diario sin complicaciones.'),
('Adrián Solís','@adriansolis','Instagram','moda','{lifestyle,viajes}','Marbella',520000,1.6,61,'25-34','España','{lujo}','aspiracional','{Relojes Vértice,Náutica Bruma,Maison Ardelle}',5200,'Engagement muy bajo para su tamaño; posible compra de seguidores en el pasado.','Moda masculina premium, coches clásicos y vida en la costa. Estética muy cuidada.'),
('Claudia Méndez','@claudiamamaprimeriza','TikTok','maternidad','{humor}','Sevilla',36000,10.4,96,'25-34','España','{familia,humor,"body positive"}','divertido','{Biberones Luna}',380,NULL,'Mamá primeriza que cuenta el posparto con humor y honestidad. Comunidad muy activa.'),
('Mateo Albiol','@mateotrail','YouTube','viajes','{fitness,sostenibilidad}','Huesca',58000,5.9,35,'25-34','España','{aventura,sostenibilidad}','experto','{Botas Cumbre,Mochilas Ébano}',700,NULL,'Guía de montaña en el Pirineo. Rutas, material técnico y respeto por la naturaleza.'),
('Noelia Brandariz','@noeliaverde','Instagram','sostenibilidad','{belleza}','Vigo',74000,5.4,88,'25-34','España','{sostenibilidad,"vida sana"}','experto','{Jabones Brétema,Hojarasca Cosmética}',750,NULL,'Bióloga marina que divulga sobre cosmética sólida y plásticos en el océano.'),
('Gonzalo Arteaga','@gonzaarteaga','TikTok','lifestyle','{gastronomía,humor}','Madrid',335000,6.8,52,'18-24','España','{humor}','divertido','{Hamburguesas Brasa,Bebidas Chispa}',3200,'Comentarios ofensivos en un directo de 2023 generaron una ola de críticas; pidió disculpas públicas.','Vida en Madrid contada a base de humor: planes, comida rápida y cultura pop.'),
('Rocío Valcárcel','@rociovalcarcel','Instagram','belleza','{moda,lifestyle}','Granada',61000,4.9,92,'25-34','España','{"body positive",naturalidad}','cercano','{Esmaltes Kora,Pelo Raíz}',650,NULL,'Peluquera y maquilladora. Peinados fáciles para el día a día y belleza natural.'),
('Iker Zubiri','@ikercome','Instagram','gastronomía','{viajes}','San Sebastián',248000,3.7,50,'25-34','España','{lujo,tradición}','aspiracional','{Vinos Txoko,Restaurantes Gorri}',2700,NULL,'Crítico gastronómico. Reseñas de restaurantes de autor y bares de pintxos con mirada exigente.'),
('Marina Escrivá','@marinaescriva','YouTube','decoración','{sostenibilidad,"hecho a mano"}','Castellón',112000,4.4,85,'35-44','España','{"hecho a mano",sostenibilidad}','experto','{Cerámica Aljibe,Pinturas Marea}',1200,NULL,'Restauradora de muebles. Tutoriales largos y pausados de restauración y tintes naturales.'),
('Alejandro Quirós','@alexquiros','YouTube','fitness','{gastronomía}','Oviedo',740000,3.2,28,'18-24','España','{superación,"vida sana"}','experto','{Proteínas Alce,Gimnasios Titán,Suplementos Vigor}',8000,'Promocionó un suplemento retirado del mercado por la autoridad sanitaria en 2024.','Culturista natural con contenido de entrenamiento de fuerza y nutrición deportiva.'),
('Lorena Peris','@lorenaperis','Instagram','lifestyle','{maternidad,decoración}','Palma',45000,6.0,90,'35-44','España','{familia,sostenibilidad}','cercano','{Lino & Roble}',420,NULL,'Vida slow en Mallorca con sus hijos: casa, huerto y escapadas por la isla.'),
('Víctor Santamaría','@victorsantamaria','TikTok','moda','{humor}','Barcelona',175000,7.6,58,'18-24','España','{humor,"body positive"}','divertido','{Zapatillas Kite,Camisetas Ruido}',1800,NULL,'Moda urbana y streetwear con mucho humor. Retos de outfits por menos de 50 €.'),
('Ainhoa Gorostiza','@ainhoaviaja','Instagram','viajes','{gastronomía,lifestyle}','Bilbao',89000,4.7,79,'25-34','España','{aventura,sostenibilidad}','aspiracional','{Hostales Brisa,Aerolíneas Sirocco}',900,NULL,'Viajes lentos y con conciencia. Guías detalladas de rincones del norte de España y Portugal.'),
('Patricia Lobato','@patrilobato','Instagram','moda','{belleza,lifestyle}','Madrid',398000,2.7,90,'25-34','España','{lujo,"vida sana"}','aspiracional','{Velluto,Joyería Brumal}',4200,NULL,'Fashion editor freelance. Tendencias, looks de oficina y el día a día en Madrid.'),
('Samuel Ortega','@samuelplanetaverde','TikTok','sostenibilidad','{humor}','Madrid',268000,9.0,57,'18-24','España','{sostenibilidad,humor,activismo}','divertido','{Botellas Río}',2400,NULL,'Activista climático joven que explica la crisis climática con humor y datos.'),
('Teresa Bonilla','@teresacrianza','YouTube','maternidad','{"vida sana"}','Salamanca',44000,5.6,93,'25-34','España','{familia,ciencia}','experto','{Pañales Nido}',500,NULL,'Pediatra que responde dudas de crianza basadas en evidencia. Tono tranquilo y didáctico.'),
('Nacho Revuelta','@nachorevuelta','Instagram','gastronomía','{humor,lifestyle}','Santander',19500,8.3,49,'25-34','España','{humor,tradición}','divertido','{Conservas Bahía}',220,'Audiencia con posibles seguidores falsos: 18% de cuentas inactivas detectadas.','Tapeo por Cantabria con mucho humor. Recomendaciones de bares de toda la vida.'),
('Cristina Lerma','@cristinalerma','Instagram','belleza','{fitness,"vida sana"}','Murcia',122000,4.2,94,'35-44','España','{"vida sana","body positive",naturalidad}','cercano','{Dermalía,Esmaltes Kora}',1250,NULL,'Belleza a partir de los 40 sin complejos. Rutinas sencillas y cuidado de la piel madura.');