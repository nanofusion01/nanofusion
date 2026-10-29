import { getKnowledgeBase, getBotEnabledStatus } from './actions'
import { unwrapResult } from '@/lib/action-result'
import { BotTrainingClient } from './bot-training-client'

export default async function BotTrainingPage() {
  const knowledge = unwrapResult(await getKnowledgeBase())
  const isBotEnabled = unwrapResult(await getBotEnabledStatus())
  
  return (
    <BotTrainingClient initialKnowledge={knowledge} initialBotEnabled={isBotEnabled} />
  )
}
