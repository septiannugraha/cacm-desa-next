import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET by id
export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = context.params;

    const peran = await prisma.cACM_Peran.findFirst({
      where: { Peran: { equals: id, mode: "insensitive" } },
    });

    if (!peran) return NextResponse.json({ error: "Peran tidak ditemukan" }, { status: 404 });
    return NextResponse.json(peran);
  } catch (err) {
    console.error("Failed to fetch peran:", err);
    return NextResponse.json({ error: "Failed to fetch peran" }, { status: 500 });
  }
}

// CREATE
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { Peran, Keterangan, Menu } = body;

    const created = await prisma.cACM_Peran.create({
      data: {
        Peran,
        Keterangan,
        Menu,
        create_at: new Date(),
        create_by: session.user?.email ?? "system",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Failed to create peran:", err);
    return NextResponse.json({ error: "Failed to create peran" }, { status: 500 });
  }
}

// UPDATE
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = context.params;
    const body = await req.json();
    const { Peran, Keterangan, Menu } = body;

    const updated = await prisma.cACM_Peran.update({
      where: { Peran: { equals: id, mode: "insensitive" } },
      data: {
        Peran: Peran ?? id,
        Keterangan: Keterangan ?? undefined,
        Menu: Menu ?? undefined,
        update_at: new Date(),
        update_by: session.user?.email ?? "system",
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("Failed to update peran:", err);
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Peran tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update peran" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(_req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = context.params;

    await prisma.cACM_Peran.delete({
      where: { Peran: { equals: id, mode: "insensitive" } },
    });

    return NextResponse.json({ message: "Peran dihapus" }, { status: 200 });
  } catch (err: any) {
    console.error("Failed to delete peran:", err);
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Peran tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete peran" }, { status: 500 });
  }
}