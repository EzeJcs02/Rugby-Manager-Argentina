import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERFILES = {
  'Pilar Izq':    { scrum: 80, lineout: 58, tackle: 70, velocidad: 44, pase: 50, pie: 44, vision: 50, potencia: 82, motor: 72, liderazgo: 60 },
  'Hooker':       { scrum: 76, lineout: 80, tackle: 70, velocidad: 50, pase: 55, pie: 50, vision: 55, potencia: 74, motor: 74, liderazgo: 66 },
  'Pilar Der':    { scrum: 84, lineout: 58, tackle: 72, velocidad: 42, pase: 48, pie: 42, vision: 48, potencia: 84, motor: 70, liderazgo: 58 },
  'Segunda Línea':{ scrum: 64, lineout: 84, tackle: 70, velocidad: 50, pase: 48, pie: 48, vision: 52, potencia: 82, motor: 80, liderazgo: 62 },
  'Ala':          { scrum: 54, lineout: 64, tackle: 84, velocidad: 68, pase: 55, pie: 52, vision: 58, potencia: 74, motor: 84, liderazgo: 60 },
  'Octavo':       { scrum: 58, lineout: 64, tackle: 82, velocidad: 70, pase: 62, pie: 55, vision: 65, potencia: 78, motor: 82, liderazgo: 70 },
  'Medio Scrum':  { scrum: 40, lineout: 38, tackle: 60, velocidad: 80, pase: 90, pie: 66, vision: 84, potencia: 54, motor: 70, liderazgo: 74 },
  'Apertura':     { scrum: 38, lineout: 38, tackle: 58, velocidad: 72, pase: 86, pie: 86, vision: 86, potencia: 54, motor: 64, liderazgo: 82 },
  'Wing':         { scrum: 34, lineout: 34, tackle: 64, velocidad: 92, pase: 62, pie: 68, vision: 70, potencia: 62, motor: 64, liderazgo: 54 },
  'Centro':       { scrum: 42, lineout: 40, tackle: 76, velocidad: 78, pase: 72, pie: 62, vision: 72, potencia: 72, motor: 72, liderazgo: 65 },
  'Fullback':     { scrum: 36, lineout: 36, tackle: 68, velocidad: 84, pase: 68, pie: 84, vision: 82, potencia: 62, motor: 68, liderazgo: 66 },
};

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v) { return Math.max(1, Math.min(99, v)); }

function crearAtributos(posicion, calidad = 1.0) {
  const base = PERFILES[posicion];
  const attrs = {};
  for (const [k, v] of Object.entries(base)) {
    attrs[k] = clamp(Math.round((v + rand(-8, 8)) * calidad));
  }
  return attrs;
}

function calcularValor(attrs) {
  const prom = Object.values(attrs).reduce((a, b) => a + b, 0) / 10;
  return Math.round(prom * 8000 * (0.85 + Math.random() * 0.3));
}

function j(nombre, apellido, edad, posicion, numero, calidad = 1.0) {
  const attrs = crearAtributos(posicion, calidad);
  return { nombre, apellido, edad, posicion, numero, ...attrs, valor: calcularValor(attrs), moral: rand(70, 92) };
}

// ─── PLANTELES ────────────────────────────────────────────────────────────────

const planteles = {

  // ── PAMPAS (Buenos Aires) ─────────────────────────────────────────
  'Pampas': [
    j('Nahuel',    'Tetaz Chaparro', 28, 'Pilar Izq',    1,  1.02),
    j('Julián',    'Montoya',        30, 'Hooker',       2,  1.04),
    j('Francisco', 'Gómez Kodela',   26, 'Pilar Der',    3,  1.02),
    j('Guido',     'Petti',          29, 'Segunda Línea',4,  1.02),
    j('Tomás',     'Lavanini',       29, 'Segunda Línea',5,  1.01),
    j('Marcos',    'Kremer',         27, 'Ala',          6,  1.03),
    j('Pablo',     'Matera',         31, 'Ala',          7,  1.04),
    j('Facundo',   'Isa',            32, 'Octavo',       8,  1.01),
    j('Gonzalo',   'Bertranou',      29, 'Medio Scrum',  9,  1.04),
    j('Santiago',  'Carreras',       26, 'Apertura',     10, 1.03),
    j('Emiliano',  'Boffelli',       28, 'Wing',         11, 1.02),
    j('Jerónimo',  'de la Fuente',   31, 'Centro',       12, 1.01),
    j('Matías',    'Moroni',         30, 'Centro',       13, 1.01),
    j('Rodrigo',   'Bruni',          27, 'Ala',          6,  1.00),
    j('Juan Cruz', 'Mallía',         25, 'Fullback',     15, 1.03),
    j('Santiago',  'Cordero',        32, 'Wing',         14, 0.99),
    j('Tomás',     'Albornoz',       26, 'Apertura',     10, 0.97),
    j('Lautaro',   'Bazán Vélez',    23, 'Medio Scrum',  9,  0.95),
    j('Ignacio',   'Mendy',          24, 'Wing',         14, 0.95),
    j('Lucio',     'Sordoni',        24, 'Segunda Línea',4,  0.94),
    j('Felipe',    'Aramendia',      24, 'Pilar Izq',    1,  0.93),
    j('Agustín',   'Creevy',         37, 'Hooker',       2,  0.91),
  ],

  // ── DOGOS XV (Córdoba) ────────────────────────────────────────────
  'Dogos XV': [
    j('Mayco',     'Vivas',          30, 'Pilar Izq',    1,  0.99),
    j('Agustín',   'Creevy',         36, 'Hooker',       2,  0.96),
    j('Joel',      'Sclavi',         28, 'Pilar Der',    3,  0.99),
    j('Matías',    'Alemanno',       29, 'Segunda Línea',4,  0.98),
    j('Lucas',     'Paulos',         27, 'Segunda Línea',5,  0.97),
    j('Juan Martín','González',      24, 'Ala',          6,  0.99),
    j('Tomás',     'Lezana',         28, 'Ala',          7,  0.97),
    j('Carlos',    'Muzzio',         29, 'Octavo',       8,  0.98),
    j('Tomás',     'Passerotti',     25, 'Medio Scrum',  9,  0.97),
    j('Nicolás',   'Sánchez',        33, 'Apertura',     10, 0.96),
    j('Bautista',  'Delguy',         28, 'Wing',         11, 0.98),
    j('Matías',    'Ponce',          26, 'Centro',       12, 0.97),
    j('Ignacio',   'Brex',           25, 'Centro',       13, 0.98),
    j('Santiago',  'Grondona',       25, 'Ala',          6,  0.96),
    j('Joaquín',   'Tuculet',        32, 'Fullback',     15, 0.97),
    j('Ramiro',    'Moyano',         31, 'Wing',         14, 0.96),
    j('Federico',  'Díaz',           28, 'Apertura',     10, 0.95),
    j('Gonzalo',   'García',         27, 'Medio Scrum',  9,  0.94),
    j('Luciano',   'Torres',         22, 'Wing',         14, 0.89),
    j('Agustín',   'Flores',         24, 'Hooker',       2,  0.91),
    j('Rodrigo',   'Martínez',       23, 'Pilar Izq',    1,  0.89),
    j('Diego',     'Portillo',       24, 'Segunda Línea',5,  0.88),
  ],

  // ── YACARÉ XV (Mesopotamia / Litoral) ─────────────────────────────
  'Yacaré XV': [
    j('Ramiro',    'Herrera',        26, 'Pilar Izq',    1,  0.92),
    j('Santiago',  'Medina',         28, 'Hooker',       2,  0.91),
    j('Iván',      'Zerbino',        27, 'Pilar Der',    3,  0.93),
    j('Agustín',   'Isa',            26, 'Segunda Línea',4,  0.92),
    j('Federico',  'Gutiérrez',      25, 'Segunda Línea',5,  0.91),
    j('Tomás',     'Roger',          24, 'Ala',          6,  0.92),
    j('Rodrigo',   'Fernández Criado',28,'Octavo',       8,  0.93),
    j('Hernán',    'Senatore',       29, 'Ala',          7,  0.90),
    j('Bautista',  'Ezcurra',        25, 'Medio Scrum',  9,  0.92),
    j('Felipe',    'Contepomi',      25, 'Apertura',     10, 0.93),
    j('Agustín',   'Palavecino',     23, 'Wing',         11, 0.90),
    j('Gonzalo',   'Iglesias',       27, 'Centro',       12, 0.91),
    j('Joaquín',   'Díaz Bonilla',   26, 'Wing',         14, 0.91),
    j('Marcos',    'Violi',          30, 'Medio Scrum',  9,  0.89),
    j('Juan Bautista','Pedemonte',   24, 'Fullback',     15, 0.92),
    j('Ignacio',   'Callegari',      26, 'Centro',       13, 0.90),
    j('Ezequiel',  'Rins',           28, 'Pilar Izq',    1,  0.88),
    j('Nahuel',    'Chaparro',       24, 'Hooker',       2,  0.87),
    j('Lucas',     'Garaizabal',     23, 'Ala',          6,  0.86),
    j('Sebastián', 'Vidal',          22, 'Wing',         11, 0.85),
    j('Matías',    'Díaz',           24, 'Centro',       12, 0.86),
    j('Franco',    'Cucchiaroni',    23, 'Segunda Línea',4,  0.85),
  ],

  // ── COBRAS (Brasil) ───────────────────────────────────────────────
  'Cobras': [
    j('Rodrigo',   'Silva',          27, 'Pilar Izq',    1,  0.90),
    j('Gabriel',   'Nóbrega',        26, 'Hooker',       2,  0.89),
    j('Felipe',    'Sancery',        28, 'Pilar Der',    3,  0.90),
    j('Lucas',     'Tranquez',       25, 'Segunda Línea',4,  0.89),
    j('Rafael',    'Alves',          27, 'Segunda Línea',5,  0.88),
    j('Tomás',     'Alemán',         24, 'Ala',          6,  0.89),
    j('João',      'Moutinho',       25, 'Ala',          7,  0.88),
    j('Guilherme', 'Augusto',        29, 'Octavo',       8,  0.90),
    j('Pedro',     'Heluy',          26, 'Medio Scrum',  9,  0.89),
    j('Lucas',     'Duque',          27, 'Apertura',     10, 0.90),
    j('Rodrigo',   'Valente',        23, 'Wing',         11, 0.88),
    j('Eduardo',   'Mussalli',       28, 'Centro',       12, 0.89),
    j('Marcos',    'Vidal',          26, 'Centro',       13, 0.88),
    j('Hugo',      'Rocha',          25, 'Wing',         14, 0.87),
    j('Felipe',    'Corrêa',         28, 'Fullback',     15, 0.90),
    j('Cauã',      'Dos Santos',     24, 'Ala',          7,  0.86),
    j('Rafael',    'Soaresinho',     23, 'Hooker',       2,  0.84),
    j('Vítor',     'Laborne',        25, 'Medio Scrum',  9,  0.85),
    j('Lucas',     'Mota',           22, 'Wing',         11, 0.83),
    j('Pedro',     'Saraiva',        24, 'Segunda Línea',5,  0.84),
    j('João',      'Pedro Galvão',   23, 'Pilar Izq',    1,  0.82),
    j('Guilherme', 'Dotti',          22, 'Centro',       12, 0.82),
  ],

  // ── SELKNAM (Chile) ───────────────────────────────────────────────
  'Selknam': [
    j('Rodrigo',   'Fernández',      28, 'Pilar Izq',    1,  0.92),
    j('Tomás',     'Dussaillant',    26, 'Hooker',       2,  0.91),
    j('Martín',    'Sigren',         27, 'Pilar Der',    3,  0.92),
    j('Clemente',  'Saavedra',       25, 'Segunda Línea',4,  0.91),
    j('Pablo',     'Garafulic',      29, 'Segunda Línea',5,  0.92),
    j('Rodrigo',   'Onetto',         26, 'Ala',          6,  0.91),
    j('Ignacio',   'Silva',          24, 'Ala',          7,  0.90),
    j('Santiago',  'Videla',         28, 'Octavo',       8,  0.92),
    j('Marcelo',   'Torrealba',      27, 'Medio Scrum',  9,  0.91),
    j('Benjamín',  'Videla',         25, 'Apertura',     10, 0.92),
    j('Sebastián', 'Cancelliere',    28, 'Wing',         11, 0.91),
    j('Cristóbal', 'Fierro',         26, 'Centro',       12, 0.91),
    j('Nicolás',   'Garafulic',      24, 'Centro',       13, 0.90),
    j('Diego',     'Escobar',        25, 'Wing',         14, 0.89),
    j('Felipe',    'Ávila',          27, 'Fullback',     15, 0.91),
    j('Francisco', 'Urroz',          23, 'Ala',          6,  0.87),
    j('Matías',    'Dittborn',       24, 'Hooker',       2,  0.86),
    j('Pablo',     'Lemoine',        26, 'Pilar Der',    3,  0.87),
    j('Rodrigo',   'Cabello',        23, 'Medio Scrum',  9,  0.85),
    j('Francisco', 'Zambrano',       22, 'Wing',         11, 0.84),
    j('Andrés',    'Vilaseca',       25, 'Segunda Línea',5,  0.85),
    j('Raimundo',  'Martínez',       23, 'Centro',       12, 0.84),
  ],

  // ── PEÑAROL RUGBY (Uruguay) ──────────────────────────────────────
  'Peñarol Rugby': [
    j('Diego',     'Arbelo',         30, 'Pilar Izq',    1,  0.88),
    j('Germán',    'Kessler',        28, 'Hooker',       2,  0.87),
    j('Nicolás',   'Freitas',        27, 'Pilar Der',    3,  0.88),
    j('Manuel',    'Diana',          26, 'Segunda Línea',4,  0.87),
    j('Ignacio',   'Dotti',          25, 'Segunda Línea',5,  0.86),
    j('Santiago',  'Civetta',        27, 'Ala',          6,  0.87),
    j('Mateo',     'Sanguinetti',    24, 'Ala',          7,  0.86),
    j('Diego',     'Magno',          28, 'Octavo',       8,  0.88),
    j('Nicolás',   'Martín',         27, 'Medio Scrum',  9,  0.87),
    j('Felipe',    'Berchesi',       26, 'Apertura',     10, 0.88),
    j('Gastón',    'Mieres',         35, 'Wing',         11, 0.86),
    j('Andrés',    'Vilaseca',       28, 'Centro',       12, 0.87),
    j('Martín',    'Landajo',        32, 'Centro',       13, 0.86),
    j('Santiago',  'Arata',          25, 'Wing',         14, 0.85),
    j('Joaquín',   'Pissano',        26, 'Fullback',     15, 0.87),
    j('Guillermo', 'Pujadas',        30, 'Ala',          7,  0.83),
    j('Iñaki',     'Martínez',       23, 'Hooker',       2,  0.82),
    j('Facundo',   'Etcheberry',     24, 'Medio Scrum',  9,  0.83),
    j('Diego',     'Ormaechea',      25, 'Apertura',     10, 0.82),
    j('Leandro',   'Leivas',         22, 'Wing',         11, 0.81),
    j('Pablo',     'Lemoine Jr.',    24, 'Pilar Izq',    1,  0.80),
    j('Agustín',   'Ormaechea',      23, 'Segunda Línea',5,  0.80),
  ],
};

function generarFixture(ids) {
  const n = ids.length;
  const fixed = ids[n - 1];
  const rotating = ids.slice(0, n - 1);
  const jornadas = [];
  for (let r = 0; r < n - 1; r++) {
    const current = [rotating[r % (n - 1)], ...rotating.slice((r + 1) % (n - 1)).concat(rotating.slice(0, r % (n - 1)))];
    const ronda = [[current[0], fixed]];
    for (let i = 1; i < n / 2; i++) ronda.push([current[i], current[n - 1 - i]]);
    jornadas.push(ronda);
  }
  return jornadas;
}

async function main() {
  console.log('🌱 Iniciando seed — Super Rugby Americas...');

  await prisma.noticia.deleteMany();
  await prisma.transferencia.deleteMany();
  await prisma.formacion.deleteMany();
  await prisma.partido.deleteMany();
  await prisma.jugador.deleteMany();
  await prisma.temporada.deleteMany();
  await prisma.club.deleteMany();

  const clubsData = [
    { nombre: 'Pampas',        ciudad: 'Buenos Aires', provincia: 'Argentina', estadio: 'Estadio CASI',                 presupuesto: 3500000, reputacion: 98, color1: '#007BC0', color2: '#FFFFFF' },
    { nombre: 'Dogos XV',      ciudad: 'Córdoba',      provincia: 'Argentina', estadio: 'Estadio Bicentenario',         presupuesto: 3200000, reputacion: 95, color1: '#1B75BC', color2: '#FFFFFF' },
    { nombre: 'Yacaré XV',     ciudad: 'Corrientes',   provincia: 'Argentina', estadio: 'Estadio Néstor Kirchner',      presupuesto: 2400000, reputacion: 82, color1: '#005A24', color2: '#FFD700' },
    { nombre: 'Cobras',        ciudad: 'São Paulo',    provincia: 'Brasil',    estadio: 'Estadio do Morumbi',           presupuesto: 2600000, reputacion: 85, color1: '#009B3A', color2: '#FFDF00' },
    { nombre: 'Selknam',       ciudad: 'Santiago',     provincia: 'Chile',     estadio: 'Estadio Nacional Julio Martínez',presupuesto: 2800000, reputacion: 88, color1: '#C8102E', color2: '#000000' },
    { nombre: 'Peñarol Rugby', ciudad: 'Montevideo',   provincia: 'Uruguay',   estadio: 'Estadio Charrúa',              presupuesto: 2200000, reputacion: 80, color1: '#1A1A1A', color2: '#FFD700' },
  ];

  console.log('📍 Creando clubes...');
  const clubs = [];
  for (const data of clubsData) {
    const club = await prisma.club.create({ data });
    clubs.push(club);
    console.log(`  ✓ ${club.nombre} (${club.ciudad})`);
  }

  console.log('👤 Creando jugadores...');
  for (const club of clubs) {
    const plantel = planteles[club.nombre];
    for (const jug of plantel) {
      await prisma.jugador.create({ data: { ...jug, clubId: club.id } });
    }
    console.log(`  ✓ ${club.nombre}: ${plantel.length} jugadores`);
  }

  console.log('📅 Creando temporada y fixture...');
  const temporada = await prisma.temporada.create({
    data: { nombre: 'Super Rugby Americas 2025', anio: 2025, activa: true },
  });

  const ids = clubs.map(c => c.id);
  const fixture = generarFixture(ids);

  for (let r = 0; r < fixture.length; r++) {
    for (const [localId, visitanteId] of fixture[r]) {
      await prisma.partido.create({
        data: { temporadaId: temporada.id, clubLocalId: localId, clubVisitanteId: visitanteId, jornada: r + 1 },
      });
    }
    console.log(`  ✓ Jornada ${r + 1}: ${fixture[r].length} partidos`);
  }

  console.log('\n✅ Seed completado!');
  console.log(`   ${clubs.length} equipos · ${clubs.length * 22} jugadores · ${fixture.length} jornadas`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
