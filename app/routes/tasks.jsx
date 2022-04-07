import { redirect } from 'remix'
import { withSSRContext } from 'aws-amplify'
import { Task } from '../../src/models'

export async function action ({ request }) {
  const body = await request.formData()
  const SSR = withSSRContext(request)

  await SSR.DataStore.save(
    new Task({
      name: body._fields.task[0],
      done: false
    })
  )
  // const user = await SSR.Auth.currentAuthenticatedUser()

  // await SSR.API.graphql({
  //   query: createTask,
  //   variables: {
  //     input: {
  //       name: body._fields.task[0],
  //       done: false
  //     }
  //   }
  // })

  return redirect('/')
}
