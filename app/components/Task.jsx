import { Form } from 'remix'
import { CheckboxField } from '@aws-amplify/ui-react'

export default function Task ({ task, submit }) {
  return (
    <li style={{ listStyleType: 'none' }}>
      <Form method='put' action={`/task/${task.id}`} style={{ marginBottom: '10px' }}>
        <CheckboxField
          checked={task.done}
          onChange={async e => {
            submit(e.currentTarget.form)
          }}
          label={task.name}
        />
      </Form>
    </li>
  )
}
