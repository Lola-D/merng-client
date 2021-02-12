import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client'
import { Icon, Button, Confirm, Popup } from 'semantic-ui-react'

import { FETCH_POSTS_QUERY } from '../utils/queries'

const DeleteButton = ({ postId, commentId, callBack }) => {
  const [confirmOpen, setConfirmOpen] = useState(false)
  
  const mutation = commentId ? DELETE_COMMENT : DELETE_POST
  
  const [deletePostOrComment] = useMutation(mutation, {
    update(cache) {
      setConfirmOpen(false)
      if (!commentId) {
        const data = cache.readQuery({
          query: FETCH_POSTS_QUERY
        })
        let newData = data.getPosts.filter((post) => post.id !== postId)
        cache.writeQuery({
          query: FETCH_POSTS_QUERY,
          data: {
            ...data,
            getPosts: {
              newData
            }
          }
        })
      }
      if (callBack) callBack()
    },
    variables: {
      postId,
      commentId
    }
  })

  return (
    <>
      <Popup
        content={commentId ? 'Delete comment' : 'Delete post'}
        inverted
        trigger={
          <Button 
            as="div" 
            color="red" 
            onClick={() => setConfirmOpen(true)}
            floated="right"
            basic
          >
            <Icon name="trash" style={{ margin: 0 }}/>
          </Button>
        }
      />
      <Confirm
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={deletePostOrComment}
      />
    </>
  );
};

const DELETE_POST = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`

const DELETE_COMMENT = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
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

export default DeleteButton;