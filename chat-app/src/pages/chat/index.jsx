import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'

import { allUsersRoute, host } from '../../services/api'
import Contacts from '../../components/contacts/index'
import Welcome from '../../components/welcome/index'
import ChatContainer from '../../components/chat/index'

export default () => {
  const socket = useRef()
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [currentUser, setCurrentUser] = useState(undefined)
  const [currentChat, setCurrentChat] = useState(undefined)

  const setUser = async () => {
    setCurrentUser(await JSON.parse(localStorage.getItem('chat-app-user')))
  }

  const getContacts = async () => {
    const token = await JSON.parse(localStorage.getItem('user-jwt'))
    const data = await axios.get(`${allUsersRoute}/${currentUser._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    setContacts(data.data)
  }

  useEffect(() => {
    setUser()
  }, [])

  useEffect(() => {
    if(currentUser) {
      socket.current = io(host)
      socket.current.emit('add-user', currentUser._id)
    }
  }, [currentUser])

  useEffect(() => {
    if(currentUser) {
      if(currentUser.isAvatarImageSet) {
        getContacts()
      } else {
        navigate('/setAvatar')
      }
    }
  }, [currentUser])

  const handleChatChange = chat => {
    setCurrentChat(chat)
  }

  return (
    <Container>
      <div className="container">
        <Contacts
          contacts={contacts}
          currentUser={currentUser}
          changeChat={handleChatChange}
        />
        {
          currentChat === undefined ? (
          <Welcome currentUser={currentUser} /> ) : (
          <ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket} /> )
        }
      </div>
    </Container>
  )
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #241313;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`