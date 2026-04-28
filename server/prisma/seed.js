import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// p(nombre, apellido, edad, posicion, scrum, lineout, tackle, velocidad, pase, pie, vision, potencia, motor, liderazgo)
function p(nombre, apellido, edad, posicion, sc, li, ta, ve, pa, pi, vi, po, mo, ld) {
  const valor = Math.round((sc + li + ta + ve + pa + pi + vi + po + mo + ld) / 10 * 8000);
  return {
    nombre, apellido, edad, posicion, moral: 80, valor,
    scrum: sc, lineout: li, tackle: ta, velocidad: ve,
    pase: pa, pie: pi, vision: vi, potencia: po, motor: mo, liderazgo: ld,
  };
}

const planteles = {

  // ── PAMPAS 2025 (Buenos Aires) ─────────────────────────────────────────────
  'Pampas': [
    //                                              sc  li  ta  ve  pa  pi  vi  po  mo  ld
    p('Javier',     'Corvalán',           26, 'Pilar Izq',    86, 56, 74, 44, 50, 44, 50, 86, 74, 64),
    p('Ignacio',    'Bottazzini',         25, 'Hooker',       78, 84, 72, 50, 56, 48, 56, 76, 76, 62),
    p('Matías',     'Medrano',            28, 'Pilar Der',    84, 58, 72, 42, 48, 42, 48, 84, 70, 62),
    p('Federico',   'Lavanini',           27, 'Segunda Línea',66, 88, 74, 52, 50, 48, 54, 84, 82, 72),
    p('Franco',     'Carrera',            25, 'Segunda Línea',62, 82, 70, 50, 48, 46, 52, 80, 78, 64),
    p('Eliseo',     'Morales',            26, 'Ala',          56, 66, 86, 70, 58, 52, 62, 74, 88, 70),
    p('Nicolás',    "D'Amorim",           25, 'Ala',          54, 62, 84, 70, 56, 50, 60, 72, 86, 66),
    p('Bruno',      'Heit',               26, 'Octavo',       60, 64, 82, 66, 62, 52, 64, 78, 82, 70),
    p('Ignacio',    'Inchauspe',          27, 'Medio Scrum',  40, 38, 62, 84, 92, 68, 90, 56, 78, 84),
    p('Bautista',   'Bosch',              26, 'Apertura',     38, 38, 60, 76, 86, 88, 86, 54, 68, 82),
    p('Francisco',  'González Capdevila', 24, 'Wing',         34, 34, 64, 90, 60, 66, 68, 62, 68, 58),
    p('Justo',      'Piccardo',           25, 'Centro',       44, 42, 78, 78, 74, 64, 76, 74, 72, 70),
    p('Juan Pablo', 'Castro',             26, 'Centro',       42, 40, 76, 76, 70, 60, 70, 70, 70, 64),
    p('Alfonso',    'Latorre',            24, 'Wing',         32, 32, 62, 88, 58, 62, 66, 58, 64, 54),
    p('Juan Pedro', 'Bernasconi',         25, 'Fullback',     38, 40, 72, 90, 72, 88, 86, 64, 74, 72),
    p('Francisco',  'Lusarreta',          24, 'Pilar Izq',    80, 52, 68, 40, 44, 40, 44, 80, 66, 56),
    p('Ramiro',     'Gurovich',           25, 'Hooker',       72, 78, 66, 46, 50, 44, 50, 68, 68, 56),
    p('Leo',        'Mazzini',            24, 'Segunda Línea',58, 78, 66, 46, 44, 42, 48, 76, 74, 58),
    p('Marcelo',    'Toledo',             27, 'Ala',          50, 58, 78, 62, 50, 46, 52, 68, 76, 58),
    p('Joaquín',    'Moro',               26, 'Octavo',       56, 60, 78, 62, 58, 48, 58, 72, 76, 66),
    p('Lautaro',    'Bazán Vélez',        23, 'Medio Scrum',  38, 36, 58, 80, 84, 62, 80, 52, 70, 68),
    p('Tomás',      'Albornoz',           26, 'Apertura',     36, 36, 54, 70, 78, 80, 76, 50, 62, 66),
  ],

  // ── DOGOS XV 2025 (Córdoba) ────────────────────────────────────────────────
  'Dogos XV': [
    //                                              sc  li  ta  ve  pa  pi  vi  po  mo  ld
    p('Diego',      'Correa',             27, 'Pilar Izq',    84, 56, 72, 42, 48, 42, 48, 84, 70, 60),
    p('Juan',       'Greising Revol',     26, 'Hooker',       76, 84, 70, 50, 54, 46, 54, 74, 74, 62),
    p('Boris',      'Wenger',             27, 'Pilar Der',    84, 58, 72, 42, 48, 42, 48, 84, 70, 60),
    p('Tomás',      'Bartolini',          26, 'Segunda Línea',62, 82, 70, 50, 48, 46, 52, 80, 78, 64),
    p('Alejandro',  'Barrios',            25, 'Segunda Línea',60, 80, 68, 48, 46, 44, 50, 78, 76, 62),
    p('Valentín',   'Cabral',             26, 'Ala',          54, 64, 84, 68, 58, 52, 60, 72, 84, 64),
    p('Aitor',      'Bildosola',          24, 'Ala',          52, 62, 82, 66, 56, 50, 58, 70, 82, 62),
    p('Octavio',    'Barbatti',           26, 'Octavo',       58, 62, 80, 64, 60, 50, 62, 74, 78, 68),
    p('Agustín',    'Moyano',             25, 'Medio Scrum',  38, 36, 58, 80, 84, 64, 82, 52, 70, 72),
    p('Efraín',     'Elías',              26, 'Apertura',     38, 38, 58, 74, 84, 86, 84, 54, 66, 80),
    p('Lautaro',    'Cipriani',           23, 'Wing',         32, 32, 62, 90, 58, 64, 68, 60, 66, 54),
    p('Agustín',    'Segura',             26, 'Centro',       42, 40, 76, 76, 70, 60, 72, 70, 70, 64),
    p('Martín',     'Renzo',              25, 'Centro',       40, 38, 74, 74, 68, 58, 70, 68, 68, 62),
    p('Ramiro',     'Valdes',             24, 'Wing',         30, 30, 60, 88, 56, 62, 64, 58, 64, 52),
    p('Valentino',  'Di Capua',           23, 'Fullback',     34, 34, 66, 86, 66, 80, 78, 60, 68, 62),
    p('Santiago',   'Pulella',            24, 'Pilar Izq',    78, 52, 66, 40, 44, 40, 44, 78, 64, 54),
    p('Leonel',     'Oviedo',             25, 'Hooker',       70, 76, 64, 46, 48, 44, 48, 66, 66, 56),
    p('Genaro',     'Podestá',            24, 'Segunda Línea',56, 74, 64, 44, 42, 40, 46, 72, 70, 54),
    p('Lautaro',    'Simes',              23, 'Ala',          48, 58, 76, 62, 50, 46, 52, 66, 74, 54),
    p('Juan',       'Sagrera',            25, 'Ala',          50, 60, 76, 62, 52, 46, 52, 68, 74, 56),
    p('Julián',     'Hernández',          24, 'Medio Scrum',  34, 32, 52, 74, 76, 58, 72, 46, 64, 60),
    p('Gastón',     'Revol',              23, 'Wing',         28, 28, 56, 84, 52, 58, 60, 52, 60, 48),
  ],

  // ── PEÑAROL RUGBY 2024 (Montevideo, Uruguay) ───────────────────────────────
  'Peñarol Rugby': [
    //                                              sc  li  ta  ve  pa  pi  vi  po  mo  ld
    p('Santiago',   'Cagnone',            28, 'Pilar Izq',    80, 54, 70, 42, 46, 42, 46, 80, 66, 60),
    p('Bautista',   'Hontou',             26, 'Hooker',       72, 78, 66, 48, 52, 46, 52, 70, 70, 62),
    p('Diego',      'Ardao',              30, 'Pilar Der',    80, 56, 70, 40, 46, 40, 46, 80, 66, 60),
    p('Felipe',     'Aliaga',             29, 'Segunda Línea',60, 82, 70, 50, 48, 46, 52, 80, 78, 68),
    p('Koba',       'Brazionis',          28, 'Segunda Línea',58, 80, 68, 48, 46, 44, 50, 78, 76, 64),
    p('Santiago',   'Civetta',            30, 'Ala',          54, 64, 84, 68, 58, 52, 62, 72, 84, 82),
    p('Lucas',      'Bianchi',            26, 'Ala',          52, 62, 82, 66, 56, 50, 58, 70, 82, 64),
    p('Manuel',     'Diana',              31, 'Octavo',       58, 62, 80, 62, 60, 50, 60, 74, 78, 72),
    p('Tomás',      'Etcheverry',         25, 'Medio Scrum',  36, 34, 56, 78, 80, 60, 78, 50, 66, 68),
    p('Mateo',      'Sanguinetti',        26, 'Apertura',     36, 36, 56, 70, 80, 82, 80, 50, 62, 72),
    p('Ignacio',    'Facciolo',           25, 'Wing',         32, 32, 62, 86, 58, 62, 66, 58, 64, 54),
    p('Juan',       'Tafernaberry',       29, 'Centro',       40, 38, 74, 74, 70, 60, 70, 70, 68, 66),
    p('Mateo',      'Perillo',            24, 'Centro',       38, 36, 70, 72, 66, 58, 66, 66, 66, 60),
    p('Gastón',     'Mieres',             34, 'Wing',         34, 34, 66, 84, 62, 66, 70, 62, 62, 76),
    p('Mateo',      'Viñals',             25, 'Fullback',     34, 34, 64, 80, 64, 78, 76, 58, 64, 64),
    p('Carlos',     'Deus',               27, 'Pilar Izq',    74, 50, 64, 38, 42, 38, 42, 74, 60, 52),
    p('Pedro',      'Hoblog',             26, 'Hooker',       66, 72, 60, 44, 46, 42, 46, 62, 62, 52),
    p('James',      'Mc Cubbin',          28, 'Segunda Línea',54, 72, 64, 44, 42, 40, 46, 70, 68, 56),
    p('Baltazar',   'Amaya',              24, 'Ala',          48, 56, 74, 60, 48, 44, 50, 64, 72, 52),
    p('Dante',      'Soto',               25, 'Octavo',       52, 56, 74, 58, 54, 46, 54, 68, 72, 58),
    p('Santiago',   'Gini',               24, 'Medio Scrum',  32, 30, 50, 72, 72, 54, 68, 44, 60, 56),
    p('Manuel',     'Rosmarino',          23, 'Wing',         28, 28, 56, 80, 52, 54, 58, 50, 58, 46),
  ],

  // ── SELKNAM 2024 (Santiago, Chile) ────────────────────────────────────────
  'Selknam': [
    //                                              sc  li  ta  ve  pa  pi  vi  po  mo  ld
    p('Salvador',   'Lues',               28, 'Pilar Izq',    80, 54, 70, 40, 46, 40, 46, 80, 66, 60),
    p('Tomás',      'Dussaillant',        26, 'Hooker',       72, 80, 66, 48, 52, 46, 52, 70, 70, 62),
    p('Iñaki',      'Gurruchaga',         27, 'Pilar Der',    80, 56, 70, 40, 46, 40, 46, 80, 66, 58),
    p('Clemente',   'Saavedra',           26, 'Segunda Línea',60, 82, 70, 50, 48, 46, 52, 80, 78, 80),
    p('Javier',     'Eissmann',           28, 'Segunda Línea',58, 80, 68, 48, 46, 44, 50, 78, 76, 66),
    p('Andrés',     'Kuzmanic',           26, 'Ala',          52, 62, 80, 64, 54, 48, 58, 70, 80, 62),
    p('Raimundo',   'Martínez',           25, 'Ala',          50, 60, 78, 62, 52, 46, 56, 68, 78, 60),
    p('Alfonso',    'Escobar',            27, 'Octavo',       56, 62, 78, 62, 58, 48, 58, 72, 76, 66),
    p('Marcelo',    'Torrealba',          27, 'Medio Scrum',  36, 34, 56, 78, 82, 60, 78, 50, 66, 70),
    p('Rodrigo',    'Fernández',          26, 'Apertura',     36, 36, 56, 70, 82, 82, 82, 52, 62, 74),
    p('Iñaki',      'Delguy',             24, 'Wing',         32, 32, 62, 90, 56, 62, 66, 58, 64, 54),
    p('Matías',     'Garafulic',          26, 'Centro',       38, 36, 72, 72, 68, 58, 68, 68, 66, 64),
    p('Nicolás',    'Roger',              25, 'Centro',       36, 34, 68, 70, 64, 54, 62, 64, 62, 56),
    p('Cristóbal',  'Game',               24, 'Wing',         30, 30, 60, 84, 54, 58, 62, 54, 62, 50),
    p('Franco',     'Velarde',            24, 'Fullback',     32, 32, 62, 78, 62, 74, 72, 54, 62, 60),
    p('Esteban',    'Inostroza',          27, 'Pilar Izq',    74, 50, 64, 38, 42, 38, 42, 74, 60, 52),
    p('Diego',      'Escobar',            25, 'Hooker',       64, 70, 60, 44, 46, 42, 46, 60, 62, 50),
    p('Santiago',   'Pedrero',            26, 'Segunda Línea',54, 72, 64, 44, 42, 40, 46, 70, 68, 58),
    p('Augusto',    'Sarmiento',          25, 'Segunda Línea',52, 70, 62, 42, 40, 38, 44, 68, 66, 54),
    p('Federico',   'Albrisi',            24, 'Ala',          46, 54, 72, 58, 46, 42, 48, 62, 70, 50),
    p('Rafael',     'Iriarte',            25, 'Medio Scrum',  32, 30, 50, 72, 72, 54, 68, 44, 60, 56),
    p('José Ignacio','Larenas',           23, 'Wing',         28, 28, 54, 80, 50, 52, 56, 50, 58, 44),
  ],

  // ── COBRAS BRASIL RUGBY 2025 (Jacareí, Brasil) ────────────────────────────
  'Cobras': [
    //                                              sc  li  ta  ve  pa  pi  vi  po  mo  ld
    p('Manuel',     'Todaro',             27, 'Pilar Izq',    78, 52, 68, 40, 44, 40, 44, 76, 64, 56),
    p('Cléber',     'Dias',               30, 'Hooker',       72, 76, 66, 46, 50, 44, 50, 68, 68, 72),
    p('Aoturoa',    'Seeling',            28, 'Pilar Der',    80, 56, 70, 40, 46, 40, 46, 80, 66, 58),
    p('Pedro',      'Saraiva',            26, 'Segunda Línea',54, 72, 64, 44, 42, 40, 46, 70, 68, 56),
    p('Helder',     'Lúcio',              25, 'Segunda Línea',52, 70, 62, 42, 40, 38, 44, 68, 66, 52),
    p('Moisés',     'Duque',              32, 'Ala',          52, 60, 80, 62, 52, 46, 54, 68, 78, 70),
    p('Javier',     'Coronel',            23, 'Ala',          50, 58, 76, 60, 48, 44, 50, 66, 74, 54),
    p('Guilherme',  'Augusto',            29, 'Octavo',       54, 60, 78, 62, 58, 48, 58, 72, 76, 64),
    p('Rodrigo',    'Santos',             27, 'Medio Scrum',  34, 32, 54, 76, 78, 58, 74, 48, 64, 62),
    p('Augusto',    'Guillamondegui',     26, 'Apertura',     34, 34, 54, 68, 78, 78, 78, 48, 58, 66),
    p('Rosko',      'Specman',            30, 'Wing',         32, 32, 62, 92, 58, 62, 68, 60, 64, 54),
    p('Lorenzo',    'Massari',            28, 'Centro',       38, 36, 70, 72, 68, 56, 66, 66, 64, 60),
    p('Fernando',   'Luna',               26, 'Centro',       36, 34, 68, 70, 64, 54, 62, 62, 62, 56),
    p('Robert',     'Tenório',            25, 'Wing',         28, 28, 58, 84, 52, 56, 60, 52, 60, 46),
    p('Felipe',     'Corrêa',             28, 'Fullback',     30, 30, 60, 76, 60, 72, 70, 52, 60, 58),
    p('Gabriel',    'Nóbrega',            26, 'Pilar Izq',    70, 48, 60, 36, 40, 36, 38, 68, 56, 46),
    p('João',       'Amaral',             25, 'Hooker',       62, 66, 58, 42, 44, 40, 44, 58, 58, 48),
    p('Cléber',     'Cordeiro',           27, 'Segunda Línea',48, 64, 58, 40, 38, 36, 42, 64, 62, 48),
    p('Lucas',      'Tranquez',           24, 'Ala',          44, 52, 70, 58, 44, 40, 46, 60, 68, 48),
    p('Victor',     'Silva',              24, 'Wing',         26, 26, 52, 82, 48, 50, 52, 48, 54, 42),
    p('Daniel',     'Lima',               25, 'Centro',       32, 30, 60, 64, 54, 44, 52, 54, 54, 46),
    p('Widson',     'Menezes',            24, 'Fullback',     28, 28, 56, 74, 54, 66, 62, 48, 56, 48),
  ],

  // ── YACARÉ XV 2026 (Asunción, Paraguay) ───────────────────────────────────
  'Yacaré XV': [
    //                                              sc  li  ta  ve  pa  pi  vi  po  mo  ld
    p('Lautaro',    'González',           27, 'Pilar Izq',    76, 50, 66, 38, 42, 38, 42, 74, 62, 54),
    p('Santiago',   'Medina',             26, 'Hooker',       68, 74, 62, 44, 48, 42, 48, 64, 64, 54),
    p('Iván',       'Zerbino',            25, 'Pilar Der',    76, 52, 66, 38, 42, 38, 42, 74, 62, 52),
    p('Facundo',    'Paiva',              25, 'Segunda Línea',56, 74, 64, 44, 42, 40, 46, 72, 70, 58),
    p('Estefano',   'Aranda',             24, 'Segunda Línea',54, 72, 62, 42, 40, 38, 44, 70, 68, 54),
    p('Camilo',     'Blasco',             24, 'Ala',          48, 56, 74, 60, 48, 44, 50, 64, 72, 54),
    p('Jordi',      'Chávez',             23, 'Ala',          46, 54, 72, 58, 46, 42, 48, 62, 70, 50),
    p('Joaquín',    'Domínguez',          27, 'Octavo',       54, 58, 76, 60, 56, 46, 54, 70, 74, 64),
    p('Ramiro',     'Amarilla',           26, 'Medio Scrum',  34, 32, 52, 76, 78, 58, 74, 46, 62, 66),
    p('Joaquín',    'Lamas',              25, 'Apertura',     32, 32, 50, 66, 74, 74, 74, 46, 56, 64),
    p('Agustín',    'Palavecino',         23, 'Wing',         28, 28, 54, 80, 50, 52, 56, 50, 56, 44),
    p('Gonzalo',    'Iglesias',           26, 'Centro',       36, 34, 66, 66, 60, 50, 58, 62, 60, 56),
    p('Valentino',  'Dicapua',            22, 'Centro',       34, 32, 62, 68, 58, 48, 56, 58, 58, 50),
    p('Felipe',     'Puertas',            24, 'Wing',         28, 28, 54, 78, 48, 50, 54, 48, 54, 42),
    p('Axel',       'Zapata',             23, 'Fullback',     28, 28, 56, 72, 54, 64, 62, 48, 54, 50),
    p('Rodrigo',    'Fernández Criado',   28, 'Pilar Izq',    72, 48, 60, 36, 40, 36, 40, 70, 58, 48),
    p('Nahuel',     'Chaparro',           24, 'Hooker',       60, 66, 56, 40, 42, 38, 42, 56, 56, 46),
    p('Franco',     'Cucchiaroni',        23, 'Segunda Línea',48, 62, 56, 38, 36, 34, 40, 62, 60, 44),
    p('Lucas',      'Garaizabal',         23, 'Ala',          40, 50, 66, 54, 42, 38, 44, 56, 64, 44),
    p('Marcos',     'Violi',              29, 'Medio Scrum',  30, 28, 48, 68, 68, 50, 62, 40, 56, 54),
    p('Joaquín',    'Mussi',              23, 'Apertura',     30, 30, 48, 62, 68, 68, 66, 42, 52, 56),
    p('Sebastián',  'Vidal',              22, 'Wing',         24, 24, 48, 74, 44, 46, 48, 44, 48, 38),
  ],

  // ── TARUCAS 2026 (San Miguel de Tucumán, Argentina) ───────────────────────
  'Tarucas': [
    //                                              sc  li  ta  ve  pa  pi  vi  po  mo  ld
    p('Bautista',   'Estofán',            25, 'Pilar Izq',    78, 52, 68, 40, 44, 40, 44, 76, 64, 56),
    p('Joaquín',    'Poliche',            26, 'Hooker',       70, 76, 64, 46, 50, 44, 50, 66, 66, 56),
    p('Miguel',     'Mukdise',            27, 'Pilar Der',    78, 54, 68, 40, 44, 40, 44, 76, 64, 56),
    p('Ignacio',    'Marquieguez',        25, 'Segunda Línea',56, 76, 64, 44, 42, 40, 46, 72, 70, 58),
    p('Luciano',    'Asevedo',            26, 'Segunda Línea',54, 74, 62, 42, 40, 38, 44, 70, 68, 56),
    p('Mateo',      'Pasquini',           24, 'Ala',          50, 58, 78, 62, 50, 46, 52, 66, 76, 58),
    p('Santiago',   'Saleme',             25, 'Ala',          48, 56, 76, 60, 48, 44, 50, 64, 74, 56),
    p('Facundo',    'García Hamilton',    26, 'Octavo',       56, 60, 78, 62, 58, 48, 58, 72, 76, 66),
    p('Rafael',     'O\'Gorman',          24, 'Medio Scrum',  34, 32, 52, 76, 78, 58, 74, 46, 64, 60),
    p('Simón',      'Pfister',            24, 'Apertura',     34, 34, 52, 68, 76, 76, 76, 48, 58, 64),
    p('Tomás',      'Elizalde',           25, 'Wing',         30, 30, 60, 86, 56, 60, 64, 56, 62, 52),
    p('Matías',     'Orlando',            29, 'Centro',       44, 42, 78, 78, 74, 64, 74, 74, 72, 80),
    p('Ignacio',    'Cerrutti',           25, 'Centro',       38, 36, 70, 72, 66, 56, 64, 64, 64, 58),
    p('Gonzalo',    'Nocera',             26, 'Wing',         28, 28, 58, 82, 52, 54, 58, 50, 58, 46),
    p('Máximo',     'Ledesma',            23, 'Fullback',     32, 32, 60, 78, 62, 72, 70, 52, 60, 58),
    p('José',       'Calderoni',          26, 'Pilar Izq',    72, 48, 60, 36, 40, 36, 40, 70, 58, 48),
    p('Raúl',       'Guraib',             27, 'Hooker',       64, 70, 58, 42, 44, 40, 44, 60, 60, 48),
    p('Juan Manuel','Vivas',              25, 'Segunda Línea',50, 66, 58, 40, 38, 36, 42, 64, 62, 48),
    p('Lautaro',    'García',             23, 'Ala',          42, 50, 66, 54, 42, 38, 44, 56, 64, 46),
    p('Franco',     'Molina',             23, 'Octavo',       48, 52, 70, 56, 50, 42, 50, 62, 68, 52),
    p('Ignacio',    'Cavallín',           22, 'Medio Scrum',  28, 26, 44, 68, 66, 48, 60, 38, 54, 48),
    p('Facundo',    'Villanueva',         23, 'Apertura',     28, 28, 46, 60, 66, 66, 64, 40, 50, 52),
  ],

  // ── CAPIBARAS XV 2026 (Rosario, Argentina) — primer año ───────────────────
  'Capibaras XV': [
    //                                              sc  li  ta  ve  pa  pi  vi  po  mo  ld
    p('Enzo',       'Avaca',              27, 'Pilar Izq',    80, 54, 70, 40, 46, 40, 46, 80, 66, 60),
    p('Ignacio',    'Dogliani',           26, 'Hooker',       70, 76, 64, 44, 48, 42, 48, 66, 66, 56),
    p('Lucas',      'Bür',                27, 'Pilar Der',    78, 52, 68, 40, 44, 40, 44, 76, 64, 54),
    p('Manuel',     'Bernstein',          26, 'Segunda Línea',54, 74, 66, 46, 44, 42, 48, 72, 72, 60),
    p('Ignacio',    'Gandini',            27, 'Segunda Línea',52, 72, 64, 44, 42, 40, 46, 70, 70, 56),
    p('Lorenzo',    'Colidio',            24, 'Ala',          50, 60, 78, 66, 52, 46, 54, 68, 78, 58),
    p('Felipe',     'Villagrán',          25, 'Ala',          48, 58, 76, 64, 50, 44, 52, 66, 76, 56),
    p('Bruno',      'Heit',               26, 'Octavo',       56, 60, 78, 62, 58, 48, 58, 72, 76, 66),
    p('Juan',       'Lovell',             25, 'Medio Scrum',  34, 32, 54, 76, 78, 60, 74, 46, 64, 62),
    p('Juan',       'Baronio',            24, 'Apertura',     34, 34, 52, 68, 74, 74, 72, 46, 56, 62),
    p('Franco',     'Rossetto',           23, 'Wing',         28, 28, 58, 84, 52, 56, 60, 52, 60, 48),
    p('Jerónimo',   'Gómez Vara',         26, 'Centro',       38, 36, 70, 70, 64, 54, 62, 64, 64, 58),
    p('Gino',       'Dicapua',            25, 'Centro',       36, 34, 66, 68, 60, 50, 58, 60, 60, 54),
    p('Lautaro',    'Cipriani',           24, 'Wing',         28, 28, 56, 82, 50, 54, 56, 50, 58, 46),
    p('Martín',     'Vaca',               27, 'Fullback',     32, 32, 62, 78, 62, 72, 70, 54, 62, 60),
    p('Diego',      'Correa',             28, 'Pilar Izq',    76, 50, 66, 38, 42, 38, 42, 74, 62, 52),
    p('Martiniano', 'Aime',               21, 'Hooker',       58, 62, 52, 38, 40, 36, 40, 54, 54, 42),
    p('Basilio',    'Cañas',              20, 'Segunda Línea',44, 60, 52, 36, 34, 32, 38, 58, 56, 40),
    p('Pietro',     'Croce',              20, 'Ala',          38, 46, 60, 52, 38, 34, 40, 50, 58, 38),
    p('Franco',     'Marizza',            21, 'Ala',          36, 44, 58, 54, 36, 32, 38, 48, 56, 36),
    p('Benjamín',   'Ordiz',              20, 'Medio Scrum',  24, 22, 38, 60, 58, 42, 54, 32, 46, 42),
    p('Mateo',      'Tanoni',             21, 'Wing',         22, 22, 44, 68, 40, 42, 44, 38, 46, 34),
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

  const clubsData = [
    { nombre: 'Pampas',       ciudad: 'San Isidro',            provincia: 'Argentina', estadio: 'Estadio del CASI',              presupuesto: 3500000, reputacion: 98, color1: '#75AADB', color2: '#FFFFFF' },
    { nombre: 'Dogos XV',     ciudad: 'Córdoba',               provincia: 'Argentina', estadio: 'Córdoba Athletic Club',          presupuesto: 3200000, reputacion: 96, color1: '#1A1A1A', color2: '#1B75BC' },
    { nombre: 'Peñarol Rugby',ciudad: 'Montevideo',            provincia: 'Uruguay',   estadio: 'Estadio Charrúa',               presupuesto: 3000000, reputacion: 95, color1: '#1A1A1A', color2: '#FFD700' },
    { nombre: 'Selknam',      ciudad: 'Santiago',              provincia: 'Chile',     estadio: 'CARR La Reina',                 presupuesto: 2800000, reputacion: 88, color1: '#1A1A1A', color2: '#C8102E' },
    { nombre: 'Tarucas',      ciudad: 'San Miguel de Tucumán', provincia: 'Argentina', estadio: 'Estadio Héctor Cabrera',        presupuesto: 2600000, reputacion: 86, color1: '#FF6B00', color2: '#1A1A1A' },
    { nombre: 'Cobras',       ciudad: 'Jacareí',               provincia: 'Brasil',    estadio: 'Estádio Nicolau Alayon',        presupuesto: 2500000, reputacion: 84, color1: '#E8A200', color2: '#7B1C3A' },
    { nombre: 'Yacaré XV',    ciudad: 'Asunción',              provincia: 'Paraguay',  estadio: 'Estadio Héroes de Curupayty',   presupuesto: 2200000, reputacion: 80, color1: '#D52B1E', color2: '#FFFFFF' },
    { nombre: 'Capibaras XV', ciudad: 'Rosario',               provincia: 'Argentina', estadio: 'Jockey Club de Rosario',        presupuesto: 2000000, reputacion: 76, color1: '#CC0000', color2: '#FFFFFF' },
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
    if (!plantel) { console.warn(`  ⚠ Sin plantel para ${club.nombre}`); continue; }
    for (const jug of plantel) {
      await prisma.jugador.create({ data: { ...jug, clubId: club.id } });
    }
    const ovrs = plantel.map(j => Math.round((j.scrum+j.lineout+j.tackle+j.velocidad+j.pase+j.pie+j.vision+j.potencia+j.motor+j.liderazgo)/10));
    const ovrProm = Math.round(ovrs.reduce((a,b)=>a+b,0)/ovrs.length);
    console.log(`  ✓ ${club.nombre}: ${plantel.length} jugadores · OVR promedio ${ovrProm}`);
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
  }
  console.log(`  ✓ ${fixture.length} jornadas generadas`);

  console.log('\n✅ Seed completado — 8 equipos · 176 jugadores reales de la SRA');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
