import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import { gql, useMutation } from '@apollo/client'
import { Icon, Label, Button, Popup } from 'semantic-ui-react'

const LikeButton = ({ user, post: { id, likes, likeCount} }) => {
  const [liked, setLiked] = useState(false)
  
  const [likePost] = useMutation(LIKE_POST, {
    variables: { postId: id }
  })
  
  useEffect(() => {
    if (user && likes.find(like => like.username === user.username)) {
      setLiked(true)
    } else setLiked(false)
  }, [user, likes])
  
  const likeButton = user ? (
    liked ? (
      <Button color='teal'>
        <Icon name='heart' />
      </Button>
    ) : (
      <Button color='teal' basic>
        <Icon name='heart' />
      </Button>
    )
  ) : (
    <Button color='teal' basic as={Link} to='/login'>
      <Icon name='heart' />
    </Button>
  )
  
  return (
    <Button as='div' labelPosition='right' onClick={likePost}>
      <Popup
        content={liked ? 'Unlike post' : 'Like post'}
        inverted
        trigger={likeButton}
      />
      <Label basic color='teal' pointing='left'>
        {likeCount}
      </Label>
    </Button>
  );
};

const LIKE_POST = gql`
  mutation likePost(
    $postId: ID!
  ) {
    likePost(
      postId: $postId
    ) {
      id
      likeCount
      likes {
        id
        username
      }
    }
  }
`

export default LikeButton;