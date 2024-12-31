import { BsRobot } from 'react-icons/bs'
import { useChatModels } from '../../../hooks/useChatModels'

const ChangeChatModel = () => {
  const { models, activeChatModel, setActiveChatModel } = useChatModels()
  return (
    <div className="cdx-flex cdx-items-center cdx-gap-1 cdx-text-neutral-500 dark:cdx-bg-neutral-900 cdx-bg-neutral-200 cdx-border cdx-rounded-md cdx-border-neutral-400/30 dark:cdx-border-neutral-500/30 cdx-py-1 cdx-px-3">
    </div>
  )
}

export default ChangeChatModel
