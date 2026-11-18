const API_URL = process.env.API_URL ?? 'http://localhost:3000';

const DEMO_USER = { name: 'Demo', email: 'demo@car-hub.dev', password: 'demo1234' };

interface ServiceSeed {
  type: 'MAINTENANCE' | 'REPAIR' | 'MODIFICATION' | 'OTHER';
  description: string;
  cost: number;
  mileage: number;
  monthsAgo: number;
  dayOffset?: number;
  warrantyMonths?: number;
}

interface CarSeed {
  car: {
    brand: string;
    model: string;
    year: number;
    plate: string;
    mileage: number;
    nickname?: string;
  };
  services: ServiceSeed[];
}

const CARS: CarSeed[] = [
  {
    car: {
      brand: 'Volkswagen',
      model: 'Golf GTI',
      year: 2018,
      plate: 'RIO2A18',
      mileage: 68400,
      nickname: 'Daily',
    },
    services: [
      {
        type: 'MAINTENANCE',
        description: 'Troca de óleo 5W40 e filtro de óleo',
        cost: 389.9,
        mileage: 67800,
        monthsAgo: 1,
      },
      {
        type: 'MAINTENANCE',
        description: 'Revisão dos 60.000 km',
        cost: 1840,
        mileage: 60120,
        monthsAgo: 9,
      },
      {
        type: 'REPAIR',
        description: 'Substituição das pastilhas e discos dianteiros',
        cost: 1290,
        mileage: 63500,
        monthsAgo: 6,
        dayOffset: 12,
        warrantyMonths: 6,
      },
      {
        type: 'REPAIR',
        description: 'Troca da bomba d’água e válvula termostática',
        cost: 1650,
        mileage: 55200,
        monthsAgo: 14,
        warrantyMonths: 12,
      },
      {
        type: 'MODIFICATION',
        description: 'Remap de ECU estágio 1 e intake',
        cost: 2800,
        mileage: 58900,
        monthsAgo: 11,
        warrantyMonths: 12,
      },
      {
        type: 'OTHER',
        description: 'Alinhamento, balanceamento e rodízio de pneus',
        cost: 220,
        mileage: 66100,
        monthsAgo: 3,
      },
    ],
  },
  {
    car: {
      brand: 'Honda',
      model: 'Civic Si',
      year: 2008,
      plate: 'FJX9H07',
      mileage: 142300,
      nickname: 'Projeto',
    },
    services: [
      {
        type: 'MODIFICATION',
        description: 'Kit de suspensão coilover e barras estabilizadoras',
        cost: 4950,
        mileage: 139800,
        monthsAgo: 2,
        warrantyMonths: 24,
      },
      {
        type: 'MAINTENANCE',
        description: 'Troca de óleo, filtros e velas de ignição',
        cost: 520,
        mileage: 141200,
        monthsAgo: 1,
        dayOffset: 4,
      },
      {
        type: 'REPAIR',
        description: 'Retífica do cabeçote e troca do kit de correia dentada',
        cost: 3780,
        mileage: 132000,
        monthsAgo: 8,
        warrantyMonths: 12,
      },
      {
        type: 'REPAIR',
        description: 'Troca do alternador',
        cost: 890,
        mileage: 138400,
        monthsAgo: 5,
        dayOffset: 20,
        warrantyMonths: 6,
      },
      {
        type: 'OTHER',
        description: 'Licenciamento e vistoria',
        cost: 340.5,
        mileage: 140100,
        monthsAgo: 4,
      },
      {
        type: 'MODIFICATION',
        description: 'Escapamento esportivo inox 2.5"',
        cost: 1750,
        mileage: 135600,
        monthsAgo: 7,
        warrantyMonths: 12,
      },
    ],
  },
];

function toIsoDate(monthsAgo: number, dayOffset = 0): string {
  const now = new Date();
  const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const clamped = Math.min(now.getUTCDate(), lastDay);
  const resolved = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), clamped + dayOffset),
  );
  return resolved.toISOString().slice(0, 10);
}

async function call(path: string, method: string, cookie: string | null, body?: unknown) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  return response;
}

async function ensureLogin(): Promise<string> {
  const created = await call('/users', 'POST', null, DEMO_USER);

  if (created.status !== 201 && created.status !== 409) {
    throw new Error(`could not create demo user (${created.status})`);
  }

  const login = await call('/login', 'POST', null, {
    email: DEMO_USER.email,
    password: DEMO_USER.password,
  });

  if (login.status !== 200) {
    throw new Error(`could not log in demo user (${login.status})`);
  }

  const cookie = login.headers.getSetCookie()[0]?.split(';')[0];

  if (!cookie) {
    throw new Error('login did not return a session cookie');
  }

  return cookie;
}

async function main(): Promise<void> {
  const cookie = await ensureLogin();
  const existing = (await (await call('/cars', 'GET', cookie)).json()) as unknown[];

  if (existing.length > 0) {
    console.info('demo user already has cars, nothing to seed');
    return;
  }

  for (const { car, services } of CARS) {
    const response = await call('/cars', 'POST', cookie, car);

    if (response.status !== 201) {
      throw new Error(`could not create car ${car.plate} (${response.status})`);
    }

    const { id: carId } = (await response.json()) as { id: string };

    for (const service of services) {
      const { monthsAgo, dayOffset, ...fields } = service;
      const created = await call('/service-records', 'POST', cookie, {
        carId,
        ...fields,
        date: toIsoDate(monthsAgo, dayOffset),
      });

      if (created.status !== 201) {
        throw new Error(`could not create service "${service.description}" (${created.status})`);
      }
    }

    console.info(`${car.brand} ${car.model}: ${services.length} services created`);
  }

  console.info(`done. log in with ${DEMO_USER.email} / ${DEMO_USER.password}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
