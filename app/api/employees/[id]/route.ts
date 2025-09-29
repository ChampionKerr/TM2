import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const employeeUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  department: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
  password: z.string().min(6).optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url || 'http://localhost:3000');
  const id = searchParams.get('id');
  const session = await getServerSession(authOptions) as Session;
  
  if (!session || session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: 'Employee ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const employee = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
        createdAt: true,
      },
    });

    if (!employee) {
      return new Response(JSON.stringify({ error: 'Employee not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(employee), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (_error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch employee' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url || 'http://localhost:3000');
  const id = searchParams.get('id');
  const session = await getServerSession(authOptions) as Session;
  
  if (!session || session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: 'Employee ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const validatedData = employeeUpdateSchema.parse(body);

    const employee = await prisma.user.update({
      where: { id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
        createdAt: true,
      },
    });

    return new Response(JSON.stringify(employee), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.format() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Failed to update employee' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url || 'http://localhost:3000');
  const id = searchParams.get('id');
  const session = await getServerSession(authOptions) as Session;
  
  if (!session || session.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: 'Employee ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (_error) {
    return new Response(JSON.stringify({ error: 'Failed to delete employee' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}