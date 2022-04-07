import { redirect } from 'remix'
import { withSSRContext } from 'aws-amplify'
import { Task } from '../../../src/models'

export async function action ({ params, request }) {
  const SSR = withSSRContext(request)
  const taskToUpdate = await SSR.DataStore.query(Task, params.taskId)

  await SSR.DataStore.save(Task.copyOf(taskToUpdate, updated => {
    updated.done = !updated.done
  }))

  // const task = await SSR.API.graphql({
  //   query: getTask,
  //   variables: { id: params.taskId }
  // })

  // await SSR.API.graphql({
  //   query: updateTask,
  //   variables: {
  //     input: {
  //       id: params.taskId,
  //       done: !task.data.getTask.done
  //     }
  //   }
  // })
  return redirect('/')
}
