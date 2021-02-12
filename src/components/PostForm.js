import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client'
import { Form, Button } from 'semantic-ui-react'

import { FETCH_POSTS_QUERY } from '../utils/queries'
import { useForm } from '../utils/hooks'

const PostForm = () => {
  const [errors, setErrors] = useState({})
  
  const { onChange, onSubmit, values } = useForm(createPostCb, {
    body: '',
  })
  
  const [createPost] = useMutation(CREATE_POST, {
    variables: values,
    update(cache, result) {
      const data = cache.readQuery({
        query: FETCH_POSTS_QUERY
      })
      let newData = [...data.getPosts]
      newData = [result.data.createPost, ...newData]
      cache.writeQuery({
        query: FETCH_POSTS_QUERY,
        data: {
          ...data,
          getPosts: {
            newData
          }
        }
      })
      values.body = ''
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].message)
    },
  })
  
  function createPostCb () {
    createPost()
  }
  
  return (
    <div>
      <Form onSubmit={onSubmit}>
        <h2>Create a post:</h2>
        <Form.Field>
          <Form.Input
            placeholder="Hi World"
            name="body"
            value={values.body}
            onChange={onChange}
            type="text"
            error={errors.length > 0 ? true : false}
          />
        </Form.Field>
        <Button type="submit" color="teal">Submit</Button>
      </Form>
      {errors.length > 0 && (
        <div className="ui error message" style={{ marginBottom: 20 }}>
          <ul className="list">
            <li>{errors}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const CREATE_POST = gql`
  mutation createPost($body: String!) {
    createPost(body: $body) {
      id
      body
      createdAt
      username
      likeCount
      commentCount
      comments {
        id
        username
        createdAt
        body
      }
      likes {
        id
        username
        createdAt
      }
    }
  }
`

export default PostForm;
