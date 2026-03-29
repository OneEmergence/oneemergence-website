'use server'

import { revalidatePath } from 'next/cache'
import { eq, and, desc } from 'drizzle-orm'
import { requireDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth/session'
import { mapNodes, mapEdges } from '@/lib/db/schema'
import {
  CreateNodeInputSchema,
  CreateEdgeInputSchema,
  UpdateNodeInputSchema,
  UpdateNodePositionSchema,
} from '@/lib/schemas/map'
import type { MapNode, MapEdge, MapData, CreateNodeInput, CreateEdgeInput } from '@/lib/schemas/map'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getMapData(): Promise<ActionResult<MapData>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    const nodes = await db
      .select()
      .from(mapNodes)
      .where(eq(mapNodes.userId, user.id!))
      .orderBy(desc(mapNodes.createdAt))

    const edges = await db
      .select()
      .from(mapEdges)
      .where(eq(mapEdges.userId, user.id!))
      .orderBy(desc(mapEdges.createdAt))

    return {
      success: true,
      data: {
        nodes: nodes as unknown as MapNode[],
        edges: edges as unknown as MapEdge[],
      },
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function createNode(
  data: CreateNodeInput
): Promise<ActionResult<MapNode>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    const parsed = CreateNodeInputSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [node] = await db
      .insert(mapNodes)
      .values({
        userId: user.id!,
        type: parsed.data.type,
        label: parsed.data.label,
        description: parsed.data.description ?? null,
        sourceId: parsed.data.sourceId ?? null,
        sourceType: parsed.data.sourceType ?? null,
        color: parsed.data.color ?? null,
        size: parsed.data.size ?? 1,
      })
      .returning()

    revalidatePath('/inner/map')

    return {
      success: true,
      data: node as unknown as MapNode,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function updateNode(
  id: string,
  data: unknown
): Promise<ActionResult<MapNode>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    // Verify ownership
    const [existing] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, id), eq(mapNodes.userId, user.id!)))

    if (!existing) {
      return { success: false, error: 'Knoten nicht gefunden.' }
    }

    const parsed = UpdateNodeInputSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [updated] = await db
      .update(mapNodes)
      .set(parsed.data)
      .where(eq(mapNodes.id, id))
      .returning()

    revalidatePath('/inner/map')

    return {
      success: true,
      data: updated as unknown as MapNode,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function deleteNode(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    // Verify ownership
    const [existing] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, id), eq(mapNodes.userId, user.id!)))

    if (!existing) {
      return { success: false, error: 'Knoten nicht gefunden.' }
    }

    await db
      .delete(mapNodes)
      .where(eq(mapNodes.id, id))

    revalidatePath('/inner/map')

    return { success: true, data: { id } }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function createEdge(
  data: CreateEdgeInput
): Promise<ActionResult<MapEdge>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    const parsed = CreateEdgeInputSchema.safeParse(data)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    // Verify both nodes belong to user
    const [sourceNode] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, parsed.data.sourceNodeId), eq(mapNodes.userId, user.id!)))

    if (!sourceNode) {
      return { success: false, error: 'Quell-Knoten nicht gefunden.' }
    }

    const [targetNode] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, parsed.data.targetNodeId), eq(mapNodes.userId, user.id!)))

    if (!targetNode) {
      return { success: false, error: 'Ziel-Knoten nicht gefunden.' }
    }

    const [edge] = await db
      .insert(mapEdges)
      .values({
        userId: user.id!,
        sourceNodeId: parsed.data.sourceNodeId,
        targetNodeId: parsed.data.targetNodeId,
        label: parsed.data.label ?? null,
        strength: parsed.data.strength ?? 1,
      })
      .returning()

    revalidatePath('/inner/map')

    return {
      success: true,
      data: edge as unknown as MapEdge,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function deleteEdge(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    // Verify ownership
    const [existing] = await db
      .select()
      .from(mapEdges)
      .where(and(eq(mapEdges.id, id), eq(mapEdges.userId, user.id!)))

    if (!existing) {
      return { success: false, error: 'Verbindung nicht gefunden.' }
    }

    await db
      .delete(mapEdges)
      .where(eq(mapEdges.id, id))

    revalidatePath('/inner/map')

    return { success: true, data: { id } }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function updateNodePosition(
  id: string,
  x: number,
  y: number
): Promise<ActionResult<MapNode>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    // Verify ownership
    const [existing] = await db
      .select()
      .from(mapNodes)
      .where(and(eq(mapNodes.id, id), eq(mapNodes.userId, user.id!)))

    if (!existing) {
      return { success: false, error: 'Knoten nicht gefunden.' }
    }

    const parsed = UpdateNodePositionSchema.safeParse({ x, y })
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [updated] = await db
      .update(mapNodes)
      .set({
        x: parsed.data.x,
        y: parsed.data.y,
      })
      .where(eq(mapNodes.id, id))
      .returning()

    revalidatePath('/inner/map')

    return {
      success: true,
      data: updated as unknown as MapNode,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}
