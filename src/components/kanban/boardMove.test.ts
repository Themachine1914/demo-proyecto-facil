import type { Project, ProjectStatus } from '../../types/project'
import { applyDragEndItems, columnIds, moveProjectInList } from './boardMove'

function project(id: string, status: ProjectStatus, order: number): Project {
  const now = new Date()
  return {
    id,
    clientName: id,
    projectName: id,
    startDate: now,
    status,
    order,
    budget: 0,
    materialsBudget: 0,
    laborBudget: 0,
    physicalProgress: 0,
    laborCost: 0,
    materialsPurchased: 0,
    paymentsReceived: 0,
    realCost: 0,
    pendingBalance: 0,
    estimatedProfit: 0,
    createdAt: now,
    updatedAt: now,
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

const originals = [
  project('a', 'quoted', 0),
  project('b', 'in_progress', 0),
  project('c', 'to_collect', 0),
]

const movedBack = moveProjectInList(originals, 'b', 'quoted', 1)
assert(
  movedBack.find((item) => item.id === 'b')?.status === 'quoted',
  'should move a card backward to the previous column',
)
assert(
  columnIds(movedBack, 'quoted').join() === 'a,b',
  'quoted column should keep the existing card and receive the moved one',
)
assert(
  columnIds(movedBack, 'in_progress').length === 0,
  'source column should no longer contain the moved card',
)

const droppedWithStaleOver = applyDragEndItems(movedBack, originals, 'b', {
  id: 'in_progress',
  data: { current: null },
})
assert(
  droppedWithStaleOver.find((item) => item.id === 'b')?.status === 'quoted',
  'dropping should keep the backward move even if over snaps back to the origin column',
)

const droppedWithoutOver = applyDragEndItems(movedBack, originals, 'b', null)
assert(
  droppedWithoutOver.find((item) => item.id === 'b')?.status === 'quoted',
  'dropping without over should keep the column chosen during dragOver',
)

const missedDragOver = applyDragEndItems(originals, originals, 'c', {
  id: 'quoted',
  data: { current: null },
})
assert(
  missedDragOver.find((item) => item.id === 'c')?.status === 'quoted',
  'dragEnd should still apply a backward move if dragOver missed it',
)

console.log('boardMove tests passed')
