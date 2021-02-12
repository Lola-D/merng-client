import React, { useContext, useState } from 'react';
import { gql, useMutation } from '@apollo/client'
import { Form, Button } from 'semantic-ui-react'

import { AuthContext } from '../context/auth'
import { useForm } from '../utils/hooks'

const Login = ({ history }) => {
  const context = useContext(AuthContext)
  const [errors, setErrors] = useState({})
  
  // custom hook because we use the same functions multiple times
  const { onChange, onSubmit, values } = useForm(loginUserCb, {
    username: '',
    password: '',
  })
  
  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    update(_, { data: { login: userData} }) {
      context.login(userData)
      history.push('/')
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: values
  })
  
  // keyword "function" is different than "const"
  // it allow to read it throw the code
  function loginUserCb () {
    loginUser()
  }
  
  return (
    <div className="form-container">
      <Form onSubmit={onSubmit} noValidate className={loading ? 'loading' : ''}>
        <h1>Login</h1>
        <Form.Input
          label="Username"
          placeholder="Username..."
          name="username"
          value={values.username}
          onChange={onChange}
          type="text"
          error={errors.username ? true : false}
        />
        <Form.Input
          label="Password"
          placeholder="Password..."
          name="password"
          value={values.password}
          onChange={onChange}
          type="password"
          error={errors.password ? true : false}
        />
        <Button type="submit" primary>Login</Button>
      </Form>
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const LOGIN_USER = gql`
  mutation login(
    $username: String!
    $password: String!
  ) {
    login(
      username: $username
      password: $password
    ) {
      id
      username
      email
      createdAt
      token
    }
  }
`

export default Login;