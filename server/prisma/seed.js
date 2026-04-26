import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Perfiles de atributos base por posición
const PERFILES = {
  'Pilar Izq': { scrum: 80, lineout: 58, tackle: 70, velocidad: 44, pase: 50, pie: 44, vision: 50, potencia: 82, motor: 72, liderazgo: 60 },
  'Hooker':    { scrum: 76, lineout: 80, tackle: 70, velocidad: 50, pase: 55, pie: 50, vision: 55, potencia: 74, motor: 74, liderazgo: 66 },
  'Pilar Der': { scrum: 84, lineout: 58, tackle: 72, velocidad: 42, pase: 48, pie: 42, vision: 48, potencia: 84, motor: 70, liderazgo: 58 },
  'Segunda Línea': { scrum: 64, lineout: 84, tackle: 70, velocidad: 50, pase: 48, pie: 48, vision: 52, potencia: 82, motor: 80, liderazgo: 62 },
  'Ala':       { scrum: 54, lineout: 64, tackle: 84, velocidad: 68, pase: 55, pie: 52, vision: 58, potencia: 74, motor: 84, liderazgo: 60 },
  'Octavo':    { scrum: 58, lineout: 64, tackle: 82, velocidad: 70, pase: 62, pie: 55, vision: 65, potencia: 78, motor: 82, liderazgo: 70 },
  'Medio Scrum': { scrum: 40, lineout: 38, tackle: 60, velocidad: 80, pase: 90, pie: 66, vision: 84, potencia: 54, motor: 70, liderazgo: 74 },
  'Apertura':  { scrum: 38, lineout: 38, tackle: 58, velocidad: 72, pase: 86, pie: 86, vision: 86, potencia: 54, motor: 64, liderazgo: 82 },
  'Wing':      { scrum: 34, lineout: 34, tackle: 64, velocidad: 92, pase: 62, pie: 68, vision: 70, potencia: 62, motor: 64, liderazgo: 54 },
  'Centro':    { scrum: 42, lineout: 40, tackle: 76, velocidad: 78, pase: 72, pie: 62, vision: 72, potencia: 72, motor: 72, liderazgo: 65 },
  'Fullback':  { scrum: 36, lineout: 36, tackle: 68, velocidad: 84, pase: 68, pie: 84, vision: 82, potencia: 62, motor: 68, liderazgo: 66 },
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(v) { return Math.max(1, Math.min(99, v)); }

function crearAtributos(posicion, calidad = 1.0) {
  const base = PERFILES[posicion];
  const variacion = 8;
  const attrs = {};
  for (const [k, v] of Object.entries(base)) {
    attrs[k] = clamp(Math.round((v + rand(-variacion, variacion)) * calidad));
  }
  return attrs;
}

function calcularValor(attrs) {
  const prom = Object.values(attrs).reduce((a, b) => a + b, 0) / 10;
  return Math.round(prom * 8000 * (0.85 + Math.random() * 0.3));
}

function jugador(nombre, apellido, edad, posicion, numero, calidad = 1.0) {
  const attrs = crearAtributos(posicion, calidad);
  return { nombre, apellido, edad, posicion, numero, ...attrs, valor: calcularValor(attrs), moral: rand(70, 90) };
}

// ─── PLANTELES ─────────────────────────────────────────────────────────────────

const planteles = {
  'San Isidro Club': [
    jugador('Nahuel', 'Tetaz Chaparro', 28, 'Pilar Izq', 1, 1.0),
    jugador('Julián', 'Montoya', 30, 'Hooker', 2, 1.02),
    jugador('Enrique', 'Pieretto', 27, 'Pilar Der', 3, 1.0),
    jugador('Guido', 'Petti', 29, 'Segunda Línea', 4, 1.01),
    jugador('Tomás', 'Lavanini', 29, 'Segunda Línea', 5, 1.0),
    jugador('Rodrigo', 'Bruni', 27, 'Ala', 6, 0.99),
    jugador('Marcos', 'Kremer', 27, 'Ala', 7, 1.01),
    jugador('Facundo', 'Isa', 32, 'Octavo', 8, 1.0),
    jugador('Gonzalo', 'Bertranou', 29, 'Medio Scrum', 9, 1.02),
    jugador('Santiago', 'Carreras', 26, 'Apertura', 10, 1.01),
    jugador('Emiliano', 'Boffelli', 28, 'Wing', 11, 1.0),
    jugador('Jerónimo', 'de la Fuente', 31, 'Centro', 12, 1.0),
    jugador('Matías', 'Moroni', 30, 'Centro', 13, 0.99),
    jugador('Santiago', 'Cordero', 32, 'Wing', 14, 0.98),
    jugador('Juan Cruz', 'Mallía', 25, 'Fullback', 15, 1.01),
    jugador('Pablo', 'Matera', 31, 'Ala', 6, 1.02),
    jugador('Agustín', 'Creevy', 38, 'Hooker', 2, 0.93),
    jugador('Lucio', 'Sordoni', 24, 'Segunda Línea', 4, 0.95),
    jugador('Felipe', 'Aramendia', 24, 'Pilar Izq', 1, 0.92),
    jugador('Tomás', 'Albornoz', 26, 'Apertura', 10, 0.96),
    jugador('Lautaro', 'Bazán Vélez', 23, 'Medio Scrum', 9, 0.94),
    jugador('Ignacio', 'Mendy', 24, 'Wing', 14, 0.94),
  ],
  'Hindú Club': [
    jugador('Francisco', 'Gómez Kodela', 26, 'Pilar Izq', 1, 0.97),
    jugador('Ignacio', 'Ruiz', 27, 'Hooker', 2, 0.96),
    jugador('Joel', 'Sclavi', 28, 'Pilar Der', 3, 0.98),
    jugador('Matías', 'Alemanno', 29, 'Segunda Línea', 4, 0.97),
    jugador('Marcos', 'Herbst', 26, 'Segunda Línea', 5, 0.95),
    jugador('Santiago', 'Grondona', 25, 'Ala', 6, 0.97),
    jugador('Juan Martín', 'González', 24, 'Ala', 7, 0.98),
    jugador('Rodrigo', 'Báez', 27, 'Octavo', 8, 0.96),
    jugador('Tomás', 'Passerotti', 25, 'Medio Scrum', 9, 0.95),
    jugador('Federico', 'Díaz', 28, 'Apertura', 10, 0.96),
    jugador('Nicolás', 'Sánchez', 36, 'Apertura', 10, 0.92),
    jugador('Ramiro', 'Moyano', 31, 'Wing', 11, 0.95),
    jugador('Matías', 'Ponce', 26, 'Centro', 12, 0.95),
    jugador('Lucas', 'Paulos', 27, 'Centro', 13, 0.94),
    jugador('Bautista', 'Delguy', 28, 'Wing', 14, 0.97),
    jugador('Joaquín', 'Tuculet', 32, 'Fullback', 15, 0.96),
    jugador('Hernán', 'Senatore', 29, 'Ala', 6, 0.93),
    jugador('Agustín', 'Flores', 24, 'Hooker', 2, 0.91),
    jugador('Rodrigo', 'Martínez', 23, 'Pilar Izq', 1, 0.89),
    jugador('Luciano', 'Torres', 22, 'Medio Scrum', 9, 0.88),
    jugador('Sebastián', 'Vera', 25, 'Centro', 12, 0.90),
    jugador('Emanuel', 'Contepomi', 24, 'Wing', 11, 0.89),
  ],
  'Newman': [
    jugador('Mayco', 'Vivas', 30, 'Pilar Izq', 1, 0.95),
    jugador('Facundo', 'Bosch', 26, 'Hooker', 2, 0.94),
    jugador('Lucas', 'Neyra', 28, 'Pilar Der', 3, 0.95),
    jugador('Tomás', 'Cantoni', 25, 'Segunda Línea', 4, 0.94),
    jugador('Franco', 'Molina', 27, 'Segunda Línea', 5, 0.93),
    jugador('Manuel', 'Diz', 26, 'Ala', 6, 0.93),
    jugador('Javier', 'Díaz', 25, 'Ala', 7, 0.94),
    jugador('Carlos', 'Muzzio', 29, 'Octavo', 8, 0.95),
    jugador('Gonzalo', 'García', 27, 'Medio Scrum', 9, 0.93),
    jugador('Pedro', 'Albanese', 28, 'Apertura', 10, 0.94),
    jugador('Ignacio', 'Losada', 24, 'Wing', 11, 0.93),
    jugador('Agustín', 'Herrera', 26, 'Centro', 12, 0.93),
    jugador('Rodrigo', 'Gómez', 25, 'Centro', 13, 0.92),
    jugador('Mariano', 'Musso', 27, 'Wing', 14, 0.93),
    jugador('Sebastián', 'Cancelliere', 28, 'Fullback', 15, 0.94),
    jugador('Leonardo', 'Senatore', 30, 'Ala', 7, 0.91),
    jugador('Nicolás', 'Scelzo', 32, 'Pilar Der', 3, 0.90),
    jugador('Alejandro', 'Quesada', 24, 'Apertura', 10, 0.89),
    jugador('Martín', 'Landajo', 32, 'Medio Scrum', 9, 0.90),
    jugador('Andrés', 'Bosch', 23, 'Hooker', 2, 0.87),
    jugador('Pablo', 'Fernández', 22, 'Wing', 14, 0.86),
    jugador('Diego', 'Portillo', 24, 'Segunda Línea', 5, 0.88),
  ],
  'Champagnat': [
    jugador('Ramiro', 'Herrera', 26, 'Pilar Izq', 1, 0.93),
    jugador('Santiago', 'Medina', 28, 'Hooker', 2, 0.92),
    jugador('Iván', 'Zerbino', 27, 'Pilar Der', 3, 0.93),
    jugador('Agustín', 'Isa', 26, 'Segunda Línea', 4, 0.92),
    jugador('Federico', 'Gutiérrez', 25, 'Segunda Línea', 5, 0.91),
    jugador('Tomás', 'Roger', 24, 'Ala', 6, 0.92),
    jugador('Matías', 'Alemanno', 26, 'Ala', 7, 0.91),
    jugador('Rodrigo', 'Fernández Criado', 28, 'Octavo', 8, 0.93),
    jugador('Bautista', 'Ezcurra', 25, 'Medio Scrum', 9, 0.92),
    jugador('Felipe', 'Contepomi', 25, 'Apertura', 10, 0.93),
    jugador('Agustín', 'Palavecino', 23, 'Wing', 11, 0.90),
    jugador('Gonzalo', 'Iglesias', 27, 'Centro', 12, 0.91),
    jugador('Ignacio', 'Brex', 25, 'Centro', 13, 0.92),
    jugador('Joaquín', 'Díaz Bonilla', 26, 'Wing', 14, 0.91),
    jugador('Juan Bautista', 'Pedemonte', 24, 'Fullback', 15, 0.92),
    jugador('Marcos', 'Violi', 30, 'Medio Scrum', 9, 0.90),
    jugador('Ezequiel', 'Rins', 28, 'Pilar Izq', 1, 0.88),
    jugador('Nahuel', 'Chaparro', 24, 'Hooker', 2, 0.87),
    jugador('Lucas', 'Garaizabal', 23, 'Ala', 7, 0.87),
    jugador('Matías', 'Díaz', 24, 'Centro', 12, 0.87),
    jugador('Sebastián', 'Vidal', 22, 'Wing', 11, 0.85),
    jugador('Franco', 'Cucchiaroni', 23, 'Segunda Línea', 4, 0.86),
  ],
  'Belgrano Athletic': [
    jugador('Gastón', 'Revol', 29, 'Pilar Izq', 1, 0.91),
    jugador('Ignacio', 'Calles', 26, 'Hooker', 2, 0.90),
    jugador('Santiago', 'Socino', 27, 'Pilar Der', 3, 0.91),
    jugador('Lucas', 'Bur', 25, 'Segunda Línea', 4, 0.90),
    jugador('Rodrigo', 'Capo Ortega', 28, 'Segunda Línea', 5, 0.90),
    jugador('Ramiro', 'Lanas', 26, 'Ala', 6, 0.89),
    jugador('Tomás', 'Lezana', 28, 'Ala', 7, 0.91),
    jugador('Federico', 'Aramburu', 30, 'Octavo', 8, 0.90),
    jugador('Julián', 'Saez', 27, 'Medio Scrum', 9, 0.90),
    jugador('Simón', 'Fernández', 25, 'Apertura', 10, 0.91),
    jugador('Tobías', 'Borges', 24, 'Wing', 11, 0.89),
    jugador('Lucas', 'González Amorosino', 32, 'Centro', 12, 0.88),
    jugador('Martín', 'Bustos Moyano', 29, 'Centro', 13, 0.90),
    jugador('Alejandro', 'Ruggeri', 25, 'Wing', 14, 0.89),
    jugador('Joaquín', 'Pissano', 26, 'Fullback', 15, 0.90),
    jugador('Diego', 'Rivas', 28, 'Ala', 6, 0.87),
    jugador('Pablo', 'Demas', 30, 'Hooker', 2, 0.85),
    jugador('Mateo', 'Carreras', 22, 'Wing', 14, 0.87),
    jugador('Benjamín', 'Urdapilleta', 27, 'Apertura', 10, 0.88),
    jugador('Federico', 'Lousteau', 23, 'Medio Scrum', 9, 0.85),
    jugador('Nicolás', 'Freitas', 24, 'Segunda Línea', 5, 0.85),
    jugador('Andrés', 'Montes', 23, 'Pilar Der', 3, 0.84),
  ],
  'Alumni': [
    jugador('Javier', 'Ortega Desio', 34, 'Ala', 7, 0.90),
    jugador('Ignacio', 'Pérez', 26, 'Hooker', 2, 0.88),
    jugador('Marcos', 'Flores', 27, 'Pilar Izq', 1, 0.89),
    jugador('Leandro', 'Alem', 25, 'Pilar Der', 3, 0.88),
    jugador('Facundo', 'Etchegaray', 26, 'Segunda Línea', 4, 0.88),
    jugador('Santiago', 'Phelan', 29, 'Segunda Línea', 5, 0.88),
    jugador('Marcos', 'Rodríguez', 25, 'Ala', 6, 0.87),
    jugador('Lucas', 'Albornoz', 28, 'Octavo', 8, 0.89),
    jugador('Franco', 'Molina', 26, 'Medio Scrum', 9, 0.88),
    jugador('Rodrigo', 'Isgró', 27, 'Apertura', 10, 0.89),
    jugador('Facundo', 'Mazzara', 23, 'Wing', 11, 0.87),
    jugador('Ignacio', 'Callegari', 26, 'Centro', 12, 0.88),
    jugador('Felipe', 'Sancristobal', 29, 'Centro', 13, 0.88),
    jugador('Leandro', 'Abadie', 24, 'Wing', 14, 0.87),
    jugador('Matías', 'Osadczuk', 27, 'Fullback', 15, 0.89),
    jugador('Jorge', 'Camejo', 30, 'Ala', 7, 0.85),
    jugador('Agustín', 'Montoya', 23, 'Hooker', 2, 0.83),
    jugador('Nicolás', 'Castro', 24, 'Medio Scrum', 9, 0.84),
    jugador('Martín', 'Gaitán', 25, 'Apertura', 10, 0.85),
    jugador('Diego', 'Gómez', 22, 'Centro', 12, 0.82),
    jugador('Hernán', 'Rouyet', 24, 'Segunda Línea', 4, 0.83),
    jugador('Pablo', 'Villalonga', 23, 'Pilar Izq', 1, 0.82),
  ],
  'Los Tilos': [
    jugador('Pablo', 'Cuevas', 28, 'Pilar Izq', 1, 0.88),
    jugador('Rodrigo', 'Basualdo', 26, 'Hooker', 2, 0.87),
    jugador('Ignacio', 'Fernández', 27, 'Pilar Der', 3, 0.88),
    jugador('Nicolás', 'Vergallo', 25, 'Segunda Línea', 4, 0.87),
    jugador('Tomás', 'Vallejos', 26, 'Segunda Línea', 5, 0.86),
    jugador('Lucas', 'Borges', 25, 'Ala', 6, 0.87),
    jugador('Matías', 'Vidal', 24, 'Ala', 7, 0.87),
    jugador('Santiago', 'Deluy', 28, 'Octavo', 8, 0.87),
    jugador('Sebastián', 'Quiroga', 27, 'Medio Scrum', 9, 0.87),
    jugador('Joaquín', 'Arias', 25, 'Apertura', 10, 0.87),
    jugador('Leandro', 'Meza', 23, 'Wing', 11, 0.85),
    jugador('Agustín', 'Barrea', 26, 'Centro', 12, 0.86),
    jugador('Federico', 'Sotuyo', 27, 'Centro', 13, 0.86),
    jugador('Ramiro', 'Herrera', 24, 'Wing', 14, 0.85),
    jugador('Diego', 'Alduncín', 29, 'Fullback', 15, 0.87),
    jugador('Martín', 'Mostany', 30, 'Octavo', 8, 0.83),
    jugador('Facundo', 'González', 23, 'Hooker', 2, 0.81),
    jugador('Gonzalo', 'Figueroa', 24, 'Medio Scrum', 9, 0.82),
    jugador('Emiliano', 'Esteves Bosch', 28, 'Apertura', 10, 0.83),
    jugador('Matías', 'Castro', 22, 'Wing', 14, 0.80),
    jugador('Lucas', 'Melillo', 23, 'Segunda Línea', 5, 0.80),
    jugador('Fernando', 'Rosalez', 24, 'Pilar Der', 3, 0.80),
  ],
  'Pucará': [
    jugador('Facundo', 'Gigena', 27, 'Pilar Izq', 1, 0.86),
    jugador('Lucas', 'Rivero', 25, 'Hooker', 2, 0.85),
    jugador('Nicolás', 'Salvo', 26, 'Pilar Der', 3, 0.86),
    jugador('Tomás', 'Durand', 25, 'Segunda Línea', 4, 0.85),
    jugador('Federico', 'Romero', 24, 'Segunda Línea', 5, 0.84),
    jugador('Santiago', 'Ruiz', 25, 'Ala', 6, 0.85),
    jugador('Rodrigo', 'López', 24, 'Ala', 7, 0.85),
    jugador('Agustín', 'Noguera', 27, 'Octavo', 8, 0.86),
    jugador('Martín', 'Rodríguez', 26, 'Medio Scrum', 9, 0.85),
    jugador('Ignacio', 'Iglesias', 25, 'Apertura', 10, 0.86),
    jugador('Javier', 'Mendy', 23, 'Wing', 11, 0.83),
    jugador('Pablo', 'Ormaechea', 27, 'Centro', 12, 0.85),
    jugador('Guido', 'Carracedo', 26, 'Centro', 13, 0.84),
    jugador('Matías', 'Ceccucci', 24, 'Wing', 14, 0.83),
    jugador('Nicolás', 'Vergallo', 28, 'Fullback', 15, 0.85),
    jugador('Fernando', 'Torres', 29, 'Ala', 6, 0.82),
    jugador('Diego', 'Morel', 23, 'Hooker', 2, 0.80),
    jugador('Lucas', 'Queirolo', 24, 'Medio Scrum', 9, 0.81),
    jugador('Sebastián', 'Pérez', 25, 'Apertura', 10, 0.82),
    jugador('Andrés', 'Villalonga', 22, 'Wing', 11, 0.78),
    jugador('Ramiro', 'Balza', 23, 'Segunda Línea', 4, 0.79),
    jugador('Emiliano', 'Abalo', 24, 'Pilar Izq', 1, 0.78),
  ],
};

// Genera fixture round-robin con 8 equipos (7 jornadas, 4 partidos c/u)
function generarFixture(ids) {
  const n = ids.length;
  const fixed = ids[n - 1];
  const rotating = ids.slice(0, n - 1);
  const jornadas = [];

  for (let r = 0; r < n - 1; r++) {
    const ronda = [];
    const current = [rotating[(r) % (n - 1)], ...rotating.slice((r + 1) % (n - 1)).concat(rotating.slice(0, (r) % (n - 1)))];
    ronda.push([current[0], fixed]);
    for (let i = 1; i < n / 2; i++) {
      ronda.push([current[i], current[n - 1 - i]]);
    }
    jornadas.push(ronda);
  }
  return jornadas;
}

async function main() {
  console.log('🌱 Iniciando seed...');

  await prisma.transferencia.deleteMany();
  await prisma.partido.deleteMany();
  await prisma.jugador.deleteMany();
  await prisma.temporada.deleteMany();
  await prisma.club.deleteMany();

  const clubsData = [
    { nombre: 'San Isidro Club', ciudad: 'San Isidro', provincia: 'Buenos Aires', estadio: 'Estadio SIC', presupuesto: 2500000, reputacion: 95, color1: '#003087', color2: '#FFFFFF' },
    { nombre: 'Hindú Club', ciudad: 'Don Torcuato', provincia: 'Buenos Aires', estadio: 'Estadio Hindú', presupuesto: 2200000, reputacion: 90, color1: '#006400', color2: '#FFFFFF' },
    { nombre: 'Newman', ciudad: 'Tortuguitas', provincia: 'Buenos Aires', estadio: 'Estadio Newman', presupuesto: 1900000, reputacion: 87, color1: '#8B0000', color2: '#FFFFFF' },
    { nombre: 'Champagnat', ciudad: 'Martínez', provincia: 'Buenos Aires', estadio: 'Estadio Champagnat', presupuesto: 1700000, reputacion: 84, color1: '#004F9F', color2: '#FFD700' },
    { nombre: 'Belgrano Athletic', ciudad: 'Belgrano', provincia: 'Buenos Aires', estadio: 'Estadio Athletic', presupuesto: 1500000, reputacion: 82, color1: '#CC0000', color2: '#FFFFFF' },
    { nombre: 'Alumni', ciudad: 'Vicente López', provincia: 'Buenos Aires', estadio: 'Estadio Alumni', presupuesto: 1400000, reputacion: 80, color1: '#00008B', color2: '#FFFFFF' },
    { nombre: 'Los Tilos', ciudad: 'La Plata', provincia: 'Buenos Aires', estadio: 'Estadio Los Tilos', presupuesto: 1200000, reputacion: 76, color1: '#2E8B57', color2: '#FFFFFF' },
    { nombre: 'Pucará', ciudad: 'Palermo', provincia: 'Buenos Aires', estadio: 'Estadio Pucará', presupuesto: 1100000, reputacion: 73, color1: '#4B0082', color2: '#FFFFFF' },
  ];

  console.log('📍 Creando clubes...');
  const clubs = [];
  for (const data of clubsData) {
    const club = await prisma.club.create({ data });
    clubs.push(club);
    console.log(`  ✓ ${club.nombre}`);
  }

  console.log('👤 Creando jugadores...');
  for (const club of clubs) {
    const plantel = planteles[club.nombre];
    for (const j of plantel) {
      await prisma.jugador.create({ data: { ...j, clubId: club.id } });
    }
    console.log(`  ✓ ${club.nombre}: ${plantel.length} jugadores`);
  }

  console.log('📅 Creando temporada y fixture...');
  const temporada = await prisma.temporada.create({
    data: { nombre: 'Torneo de la URBA 2025', anio: 2025, activa: true },
  });

  const ids = clubs.map(c => c.id);
  const fixture = generarFixture(ids);

  for (let j = 0; j < fixture.length; j++) {
    const jornada = fixture[j];
    for (const [localId, visitanteId] of jornada) {
      await prisma.partido.create({
        data: {
          temporadaId: temporada.id,
          clubLocalId: localId,
          clubVisitanteId: visitanteId,
          jornada: j + 1,
        },
      });
    }
    console.log(`  ✓ Jornada ${j + 1}: ${jornada.length} partidos`);
  }

  console.log('\n✅ Seed completado exitosamente!');
  console.log(`   - ${clubs.length} clubes`);
  console.log(`   - ${clubs.reduce((acc, c) => acc + planteles[c.nombre].length, 0)} jugadores`);
  console.log(`   - ${fixture.length} jornadas`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
