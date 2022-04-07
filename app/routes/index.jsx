import { withSSRContext } from 'aws-amplify'
import { json, useLoaderData, useSubmit } from 'remix'
import { Heading, Button, Text } from '@aws-amplify/ui-react'
import { Task } from '../../src/models'
import { serializeModel } from '@aws-amplify/datastore/ssr'

import CreateTask from '../components/CreateTask'
import TaskDisplay from '../components/Task'

export const loader = async ({ request }) => {
  const SSR = withSSRContext(request)
  const tasks = await SSR.DataStore.query(Task)
  console.log(tasks)

  return json(serializeModel(tasks))
}

function Index ({ signOut, user }) {
  const submit = useSubmit()
  const tasks = useLoaderData()

  return (
    <div style={{ maxWidth: '60%', margin: '0 auto' }}>
      {/* <img src={logo} /> */}
      <Heading level={1} textAlign='center'>To Do</Heading>
      <ul>
        {tasks.map(task => <TaskDisplay submit={submit} key={task.id} task={task} />)}
      </ul>
      <CreateTask />
    </div>
  )
}

export default Index
