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

  // ── PAMPAS (San Isidro, Buenos Aires) ─────────────────────────────────────
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
    j('Santiago',  'Pernas',         27, 'Wing',         11, 1.01),
    j('Jerónimo',  'de la Fuente',   31, 'Centro',       12, 1.01),
    j('Agustín',   'Fraga',          26, 'Centro',       13, 1.01),
    j('Rodrigo',   'Bruni',          27, 'Ala',          6,  1.00),
    j('Juan Cruz', 'Mallía',         25, 'Fullback',     15, 1.03),
    j('Santiago',  'Cordero',        32, 'Wing',         14, 0.99),
    j('Tomás',     'Albornoz',       26, 'Apertura',     10, 0.97),
    j('Lautaro',   'Bazán Vélez',    23, 'Medio Scrum',  9,  0.95),
    j('Ignacio',   'Mendy',          24, 'Wing',         14, 0.95),
    j('Lucio',     'Sordoni',        24, 'Segunda Línea',4,  0.94),
    j('Felipe',    'Aramendia',      24, 'Pilar Izq',    1,  0.93),
    j('Tobías',    'Wade',           24, 'Fullback',     15, 0.92),
  ],

  // ── DOGOS XV (Córdoba) — Campeones 2024 ───────────────────────────────────
  'Dogos XV': [
    j('Valentín',  'Cabral',          26, 'Ala',          6,  1.00),
    j('Mayco',     'Vivas',           30, 'Pilar Izq',    1,  0.99),
    j('Joel',      'Sclavi',          28, 'Pilar Der',    3,  0.99),
    j('Matías',    'Alemanno',        29, 'Segunda Línea',4,  0.98),
    j('Lucas',     'Paulos',          27, 'Segunda Línea',5,  0.97),
    j('Juan Martín','González',       24, 'Ala',          7,  0.99),
    j('Tomás',     'Lezana',          28, 'Octavo',       8,  0.98),
    j('Carlos',    'Muzzio',          29, 'Ala',          6,  0.98),
    j('Gonzalo',   'García',          27, 'Medio Scrum',  9,  0.97),
    j('Giuliano',  'Avaca',           26, 'Apertura',     10, 0.97),
    j('Bautista',  'Delguy',          28, 'Wing',         11, 0.98),
    j('Faustino',  'Sánchez Valarolo',25, 'Centro',       12, 0.98),
    j('Agustín',   'Segura',          26, 'Centro',       13, 0.97),
    j('Santiago',  'Grondona',        25, 'Ala',          7,  0.96),
    j('Joaquín',   'Tuculet',         32, 'Fullback',     15, 0.97),
    j('Ramiro',    'Moyano',          31, 'Wing',         14, 0.96),
    j('Nicolás',   'Sánchez',         33, 'Apertura',     10, 0.95),
    j('Tomás',     'Passerotti',      25, 'Medio Scrum',  9,  0.94),
    j('Luciano',   'Torres',          22, 'Wing',         11, 0.91),
    j('Agustín',   'Flores',          24, 'Hooker',       2,  0.91),
    j('Rodrigo',   'Martínez',        23, 'Pilar Izq',    1,  0.89),
    j('Diego',     'Portillo',        24, 'Hooker',       2,  0.88),
  ],

  // ── PEÑAROL RUGBY (Montevideo, Uruguay) — 3x Campeones ───────────────────
  'Peñarol Rugby': [
    j('Felipe',    'Aliaga',          29, 'Segunda Línea',4,  0.96),
    j('Foster',    'DeWitt',          28, 'Pilar Izq',    1,  0.95),
    j('Germán',    'Kessler',         28, 'Hooker',       2,  0.94),
    j('Diego',     'Arbelo',          30, 'Pilar Der',    3,  0.94),
    j('Manuel',    'Ardao',           27, 'Segunda Línea',5,  0.93),
    j('Santiago',  'Civetta',         27, 'Ala',          6,  0.93),
    j('Lucas',     'Bianchi',         26, 'Ala',          7,  0.93),
    j('Diego',     'Magno',           28, 'Octavo',       8,  0.94),
    j('Nicolás',   'Martín',          27, 'Medio Scrum',  9,  0.93),
    j('Felipe',    'Berchesi',        26, 'Apertura',     10, 0.94),
    j('Ignacio',   'Facciolo',        25, 'Wing',         11, 0.92),
    j('Andrés',    'Vilaseca',        28, 'Centro',       12, 0.93),
    j('Martín',    'Landajo',         32, 'Centro',       13, 0.92),
    j('Santiago',  'Arata',           25, 'Wing',         14, 0.91),
    j('Joaquín',   'Pissano',         26, 'Fullback',     15, 0.93),
    j('Guillermo', 'Pujadas',         30, 'Ala',          7,  0.89),
    j('Iñaki',     'Martínez',        23, 'Hooker',       2,  0.88),
    j('Facundo',   'Etcheberry',      24, 'Medio Scrum',  9,  0.87),
    j('Diego',     'Ormaechea',       25, 'Apertura',     10, 0.86),
    j('Leandro',   'Leivas',          22, 'Wing',         11, 0.86),
    j('Pablo',     'Lemoine Jr.',     24, 'Pilar Izq',    1,  0.85),
    j('Agustín',   'Ormaechea',       23, 'Segunda Línea',5,  0.85),
  ],

  // ── SELKNAM (Santiago, Chile) ─────────────────────────────────────────────
  'Selknam': [
    j('Clemente',  'Saavedra',        26, 'Ala',          6,  0.92),
    j('Salvador',  'Lues',            28, 'Pilar Izq',    1,  0.91),
    j('Tomás',     'Dussaillant',     26, 'Hooker',       2,  0.90),
    j('Martín',    'Sigren',          27, 'Pilar Der',    3,  0.91),
    j('Pablo',     'Garafulic',       29, 'Segunda Línea',4,  0.91),
    j('Cristóbal', 'Arredondo',       25, 'Segunda Línea',5,  0.90),
    j('Rodrigo',   'Onetto',          26, 'Ala',          7,  0.91),
    j('Santiago',  'Videla',          28, 'Octavo',       8,  0.91),
    j('Marcelo',   'Torrealba',       27, 'Medio Scrum',  9,  0.90),
    j('Rodrigo',   'Fernández',       26, 'Apertura',     10, 0.92),
    j('Nicolás',   'Garafulic',       24, 'Wing',         11, 0.90),
    j('Matías',    'Garafulic',       26, 'Centro',       12, 0.91),
    j('Cristóbal', 'Fierro',          26, 'Centro',       13, 0.90),
    j('Sebastián', 'Cancelliere',     28, 'Wing',         14, 0.89),
    j('Luca',      'Strabucchi',      25, 'Fullback',     15, 0.91),
    j('Francisco', 'Urroz',           23, 'Ala',          6,  0.87),
    j('Matías',    'Dittborn',        24, 'Hooker',       2,  0.86),
    j('Pablo',     'Lemoine',         26, 'Pilar Der',    3,  0.86),
    j('Rodrigo',   'Cabello',         23, 'Medio Scrum',  9,  0.85),
    j('Francisco', 'Zambrano',        22, 'Wing',         11, 0.84),
    j('Benjamín',  'Videla',          24, 'Apertura',     10, 0.85),
    j('Raimundo',  'Hernández',       23, 'Centro',       12, 0.84),
  ],

  // ── COBRAS BRASIL RUGBY (São Paulo / Jacareí, Brasil) ─────────────────────
  'Cobras': [
    j('Lorenzo',   'Massari',         28, 'Centro',       12, 0.90),
    j('Rosko',     'Specman',         30, 'Wing',         11, 0.90),
    j('Zinedine',  'Booysen',         27, 'Medio Scrum',  9,  0.90),
    j('Rodrigo',   'Silva',           27, 'Pilar Izq',    1,  0.89),
    j('Gabriel',   'Nóbrega',         26, 'Hooker',       2,  0.88),
    j('Felipe',    'Sancery',         28, 'Pilar Der',    3,  0.89),
    j('Cléber',    'Dias',            27, 'Segunda Línea',4,  0.88),
    j('Helder',    'Lúcio',           25, 'Segunda Línea',5,  0.87),
    j('Tomás',     'Alemán',          24, 'Ala',          6,  0.88),
    j('João',      'Moutinho',        25, 'Ala',          7,  0.87),
    j('Guilherme', 'Augusto',         29, 'Octavo',       8,  0.89),
    j('Pedro',     'Heluy',           26, 'Medio Scrum',  9,  0.88),
    j('Lucas',     'Duque',           27, 'Apertura',     10, 0.89),
    j('Marcos',    'Vidal',           26, 'Centro',       13, 0.87),
    j('Felipe',    'Corrêa',          28, 'Fullback',     15, 0.89),
    j('Hugo',      'Rocha',           25, 'Wing',         14, 0.86),
    j('Cauã',      'Dos Santos',      24, 'Ala',          7,  0.85),
    j('Rafael',    'Soaresinho',      23, 'Hooker',       2,  0.84),
    j('Vítor',     'Laborne',         25, 'Medio Scrum',  9,  0.84),
    j('Lucas',     'Mota',            22, 'Wing',         11, 0.83),
    j('Pedro',     'Saraiva',         24, 'Segunda Línea',5,  0.83),
    j('João',      'Pedro Galvão',    23, 'Pilar Izq',    1,  0.82),
  ],

  // ── YACARÉ XV (Asunción, Paraguay) ───────────────────────────────────────
  'Yacaré XV': [
    j('Ramiro',    'Amarilla',        28, 'Medio Scrum',  9,  0.91),
    j('Rodrigo',   'Fernández Criado',29, 'Pilar Izq',   1,  0.89),
    j('Santiago',  'Medina',          28, 'Hooker',       2,  0.88),
    j('Iván',      'Zerbino',         27, 'Pilar Der',    3,  0.89),
    j('Facundo',   'Paiva',           26, 'Segunda Línea',4,  0.88),
    j('Estefano',  'Aranda',          24, 'Segunda Línea',5,  0.87),
    j('Camilo',    'Blasco',          25, 'Ala',          6,  0.88),
    j('Jordi',     'Chávez',          24, 'Ala',          7,  0.87),
    j('Hernán',    'Senatore',        29, 'Octavo',       8,  0.89),
    j('Joaquín',   'Mussi',           23, 'Apertura',     10, 0.88),
    j('Agustín',   'Palavecino',      24, 'Wing',         11, 0.87),
    j('Gonzalo',   'Iglesias',        27, 'Centro',       12, 0.88),
    j('Ignacio',   'Callegari',       26, 'Centro',       13, 0.87),
    j('Joaquín',   'Díaz Bonilla',    26, 'Wing',         14, 0.88),
    j('Juan Bautista','Pedemonte',    24, 'Fullback',     15, 0.88),
    j('Marcos',    'Violi',           30, 'Medio Scrum',  9,  0.85),
    j('Ezequiel',  'Rins',            28, 'Pilar Izq',    1,  0.84),
    j('Nahuel',    'Chaparro',        24, 'Hooker',       2,  0.83),
    j('Lucas',     'Garaizabal',      23, 'Ala',          6,  0.83),
    j('Sebastián', 'Vidal',           22, 'Wing',         11, 0.82),
    j('Matías',    'Díaz',            24, 'Centro',       12, 0.83),
    j('Franco',    'Cucchiaroni',     23, 'Segunda Línea',4,  0.82),
  ],

  // ── TARUCAS (San Miguel de Tucumán, Argentina) — desde 2024 ───────────────
  'Tarucas': [
    j('Matías',    'Orlando',         28, 'Centro',       12, 0.94),
    j('Diego',     'Fortuny',         29, 'Fullback',     15, 0.93),
    j('Tomás',     'Elizalde',        25, 'Wing',         11, 0.92),
    j('Bruno',     'Postiglioni',     27, 'Pilar Izq',    1,  0.91),
    j('Agustín',   'Capurro',         26, 'Hooker',       2,  0.90),
    j('Rodrigo',   'Báez',            28, 'Pilar Der',    3,  0.91),
    j('Ignacio',   'Larrañaga',       25, 'Segunda Línea',4,  0.90),
    j('Federico',  'Wegrzyn',         27, 'Segunda Línea',5,  0.89),
    j('Santiago',  'Álvarez',         24, 'Ala',          6,  0.90),
    j('Joaquín',   'Moro',            26, 'Ala',          7,  0.89),
    j('Ignacio',   'Pedraza',         28, 'Octavo',       8,  0.91),
    j('Lucas',     'Vidoret',         24, 'Medio Scrum',  9,  0.90),
    j('Rodrigo',   'Isgró',           25, 'Apertura',     10, 0.91),
    j('Gonzalo',   'Nocera',          26, 'Wing',         14, 0.89),
    j('Lisandro',  'Castellano',      28, 'Centro',       13, 0.89),
    j('Franco',    'Molina',          23, 'Wing',         11, 0.87),
    j('Lautaro',   'García',          24, 'Medio Scrum',  9,  0.86),
    j('Facundo',   'Villanueva',      23, 'Apertura',     10, 0.86),
    j('Santiago',  'Lareu',           22, 'Ala',          7,  0.85),
    j('Bruno',     'Acuña',           24, 'Hooker',       2,  0.85),
    j('Martín',    'Bustos',          25, 'Pilar Izq',    1,  0.84),
    j('Lisandro',  'Arbor',           23, 'Segunda Línea',5,  0.84),
  ],

  // ── CAPIBARAS XV (Rosario, Argentina) — desde 2025 ────────────────────────
  'Capibaras XV': [
    j('Emiliano',  'Boffelli',        28, 'Fullback',     15, 0.95),
    j('Manuel',    'Bernstein',       26, 'Ala',          7,  0.91),
    j('Ignacio',   'Gandini',         27, 'Ala',          6,  0.91),
    j('Pablo',     'Gatti',           26, 'Pilar Izq',    1,  0.88),
    j('Gonzalo',   'Gutiérrez',       26, 'Hooker',       2,  0.87),
    j('Santiago',  'Villavicencio',   27, 'Pilar Der',    3,  0.88),
    j('Rodrigo',   'Ponce',           25, 'Segunda Línea',4,  0.87),
    j('Pablo',     'Grille',          26, 'Segunda Línea',5,  0.86),
    j('Marcos',    'Moreira',         24, 'Octavo',       8,  0.87),
    j('Felipe',    'Ezcurra',         26, 'Medio Scrum',  9,  0.88),
    j('Bautista',  'Silvestre',       24, 'Apertura',     10, 0.87),
    j('Nicolás',   'Polvora',         25, 'Wing',         11, 0.86),
    j('Martín',    'Cancelliere',     27, 'Centro',       12, 0.87),
    j('Lucas',     'Doura',           26, 'Centro',       13, 0.86),
    j('Rodrigo',   'Bonino',          25, 'Wing',         14, 0.86),
    j('Juan Cruz', 'Orlando',         23, 'Medio Scrum',  9,  0.84),
    j('Tomás',     'Villanueva',      24, 'Apertura',     10, 0.84),
    j('Sebastián', 'Blas',            23, 'Wing',         11, 0.83),
    j('Facundo',   'Peralta',         24, 'Ala',          7,  0.83),
    j('Gonzalo',   'Correa',          23, 'Pilar Der',    3,  0.82),
    j('Diego',     'Cuña',            22, 'Hooker',       2,  0.81),
    j('Agustín',   'Manzotti',        23, 'Segunda Línea',5,  0.81),
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
  console.log('🌱 Iniciando seed — Super Rugby Americas 2026...');

  await prisma.noticia.deleteMany();
  await prisma.transferencia.deleteMany();
  await prisma.formacion.deleteMany();
  await prisma.partido.deleteMany();
  await prisma.jugador.deleteMany();
  await prisma.temporada.deleteMany();
  await prisma.club.deleteMany();

  // Datos reales: colores, estadios y ciudades oficiales
  const clubsData = [
    {
      nombre: 'Pampas',
      ciudad: 'San Isidro',
      provincia: 'Argentina',
      estadio: 'Estadio del CASI',
      presupuesto: 3500000,
      reputacion: 98,
      color1: '#75AADB',  // celeste claro
      color2: '#FFFFFF',
    },
    {
      nombre: 'Dogos XV',
      ciudad: 'Córdoba',
      provincia: 'Argentina',
      estadio: 'Córdoba Athletic Club',
      presupuesto: 3200000,
      reputacion: 96,
      color1: '#1A1A1A',  // negro
      color2: '#1B75BC',  // azul
    },
    {
      nombre: 'Peñarol Rugby',
      ciudad: 'Montevideo',
      provincia: 'Uruguay',
      estadio: 'Estadio Charrúa',
      presupuesto: 3000000,
      reputacion: 95,
      color1: '#1A1A1A',  // negro
      color2: '#FFD700',  // dorado
    },
    {
      nombre: 'Selknam',
      ciudad: 'Santiago',
      provincia: 'Chile',
      estadio: 'CARR La Reina',
      presupuesto: 2800000,
      reputacion: 88,
      color1: '#1A1A1A',  // negro
      color2: '#C8102E',  // rojo
    },
    {
      nombre: 'Tarucas',
      ciudad: 'San Miguel de Tucumán',
      provincia: 'Argentina',
      estadio: 'Estadio Héctor Cabrera',
      presupuesto: 2600000,
      reputacion: 86,
      color1: '#FF6B00',  // naranja
      color2: '#1A1A1A',  // negro
    },
    {
      nombre: 'Cobras',
      ciudad: 'Jacareí',
      provincia: 'Brasil',
      estadio: 'Estádio Nicolau Alayon',
      presupuesto: 2500000,
      reputacion: 84,
      color1: '#E8A200',  // dorado
      color2: '#7B1C3A',  // guinda
    },
    {
      nombre: 'Yacaré XV',
      ciudad: 'Asunción',
      provincia: 'Paraguay',
      estadio: 'Estadio Héroes de Curupayty',
      presupuesto: 2200000,
      reputacion: 80,
      color1: '#D52B1E',  // rojo paraguayo
      color2: '#FFFFFF',
    },
    {
      nombre: 'Capibaras XV',
      ciudad: 'Rosario',
      provincia: 'Argentina',
      estadio: 'Jockey Club de Rosario',
      presupuesto: 2000000,
      reputacion: 76,
      color1: '#CC0000',  // rojo
      color2: '#FFFFFF',
    },
  ];

  console.log('📍 Creando clubes...');
  const clubs = [];
  for (const data of clubsData) {
    const club = await prisma.club.create({ data });
    clubs.push(club);
    console.log(`  ✓ ${club.nombre} (${club.ciudad}, ${club.provincia})`);
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
    data: { nombre: 'Super Rugby Americas 2026', anio: 2026, activa: true },
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
