import React, { useContext, useState, useRef } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client'
import moment from 'moment';
import { Grid, Card, Icon, Label, Button, Image, Form } from 'semantic-ui-react'

import { AuthContext } from '../context/auth'
import { useForm } from '../utils/hooks'

import LikeButton from '../components/LikeButton'
import DeleteButton from '../components/DeleteButton'

const Post = ({ match, history }) => {
  const { user } = useContext(AuthContext)
  const postId = match.params.postId
  const commentInputRef = useRef(null)
  const [errors, setErrors] = useState({})
  
  const { onChange, onSubmit, values } = useForm(createCommentCb, {
    body: '',
  })
  
  const { loading, error, data } = useQuery(FETCH_POST, {
    variables: {
      postId
    }
  })
  
  const [createComment] = useMutation(CREATE_COMMENT, {
    update() {
      values.body = ''
      commentInputRef.current.blur()
    },
    variables: {
      postId,
      body: values.body
    },
    onError(err) {
      setErrors(err.graphQLErrors[0].message)
    },
  })
  
  function createCommentCb () {
    createComment()
  }
  
  const deletePostCb = () => {
    history.push("/")
  }
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  const { id, body, createdAt, username, comments, likes, commentCount, likeCount } = data.getPost

  return (
    <Grid>
      <Grid.Row>
        <Grid.Column width={2}>
          <Image
            floated='right'
            size='small'
            src='https://react.semantic-ui.com/images/avatar/large/molly.png'
            float='right'
          />
        </Grid.Column>
        <Grid.Column width={10}>
          <Card fluid>
            <Card.Content>
              <Card.Header>{username}</Card.Header>
              <Card.Meta>{moment(createdAt).fromNow(true)}</Card.Meta>
              <Card.Description>{body}</Card.Description>
            </Card.Content>
            <hr />
            <Card.Content extra>
              <LikeButton user={user} post={{ id, likes, likeCount }} />
              <Button 
                as="div" 
                labelPosition='right' 
                onClick={() => console.log('it s my comment')}
              >
                <Button color='blue' basic>
                  <Icon name='comments' />
                </Button>
                <Label basic color='blue' pointing='left'>
                  {commentCount}
                </Label>
              </Button>
              {user && user.username === username && <DeleteButton postId={id} callBack={deletePostCb}/>}
            </Card.Content>
          </Card>
          {user && (
            <Card fluid>
              <Card.Content>
                <p>Post a comment</p>
                <Form onSubmit={onSubmit}>
                  <div className='ui action input fluid'>
                  <input
                    placeholder="Comment..."
                    name="body"
                    value={values.body}
                    onChange={onChange}
                    type="text"
                    ref={commentInputRef}
                  />
                  <Button type="submit" color="teal">Submit</Button>
                  </div>
                </Form>
                {errors.length > 0 && (
                  <div className="ui error message">
                    <ul className="list">
                      <li>{errors}</li>
                    </ul>
                  </div>
                )}
              </Card.Content>
            </Card>
          )}
          {comments.map((comment) => (
            <Card fluid key={comment.id}>
              <Card.Content>
                {user && user.username === username && <DeleteButton postId={id} commentId={comment.id}/>}
                <Card.Header>{comment.username}</Card.Header>
                <Card.Meta>{moment(comment.createdAt).fromNow(true)}</Card.Meta>
                <Card.Description>{comment.body}</Card.Description>
              </Card.Content>
            </Card>
          ))}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

const CREATE_COMMENT = gql`
  mutation createComment($postId: ID!, $body: String!) {
    createComment(postId: $postId, body: $body) {
      id
      commentCount
      comments {
        id
        username
        createdAt
        body
      }
    }
  }
`

const FETCH_POST = gql`
  query($postId: ID!) {
    getPost(postId: $postId) {
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
        username
      }
    }
  }
`

export default Post;