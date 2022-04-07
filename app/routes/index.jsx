import { withSSRContext } from 'aws-amplify'
import { json, useLoaderData, useSubmit } from 'remix'
import { listTasks } from '../../src/graphql/queries'
import { withAuthenticator, Heading, Button, Text } from '@aws-amplify/ui-react'

import CreateTask from '../components/CreateTask'
import Task from '../components/Task'

export const loader = async ({ request }) => {
  const SSR = withSSRContext(request)
  console.log(listTasks)
  const tasks = await SSR.API.graphql({
    query: listTasks
  })
  console.log(tasks)

  return json({})
}

function Index ({ signOut, user }) {
  const submit = useSubmit()
  // const { tasks } = useLoaderData()

  return (
    <div style={{ maxWidth: '60%', margin: '0 auto' }}>
      {/* <img src={logo} /> */}
      <Heading level={1} textAlign='center'>To Do</Heading>
      <Text textAlign='center'>Hi, {user.attributes.email}
        <Button size='small' variation='link' onClick={() => signOut()}>Log Out</Button>
      </Text>
      <ul>
        {/* {tasks.map(task => <Task submit={submit} key={task.id} task={task} />)} */}
      </ul>
      <CreateTask />
    </div>
  )
}

export default withAuthenticator(Index)
