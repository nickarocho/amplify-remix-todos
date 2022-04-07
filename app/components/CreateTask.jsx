import { Form } from 'remix'
import { TextField, Button } from '@aws-amplify/ui-react'

export default function CreateTask () {
  return (
    <Form method='post' action='/tasks'>
      <TextField name='task' label='Create a task' />
      <Button marginTop='10px' type='submit' variation='default'>Create</Button>
    </Form>
  )
}
