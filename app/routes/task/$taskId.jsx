import { redirect } from 'remix'
import { withSSRContext } from 'aws-amplify'
import { updateTask } from '../../../src/graphql/mutations'
import { getTask } from '../../../src/graphql/queries'

export async function action ({ params, request }) {
  const SSR = withSSRContext(request)

  const task = await SSR.API.graphql({
    query: getTask,
    variables: { id: params.taskId }
  })

  await SSR.API.graphql({
    query: updateTask,
    variables: {
      input: {
        id: params.taskId,
        done: !task.data.getTask.done
      }
    }
  })
  return redirect('/')
}
