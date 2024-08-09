'use client'
import Image from "next/image";
import {useState, useEffect, useRef} from 'react'
import { Box, Button, Stack, TextField, Paper, Typography } from '@mui/material'
import ReactMarkdown from 'react-markdown'; // Import the markdown component

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi I'm the Apprentease Support Bot, how can I assist you today?`
  }])

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)
  
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text }, // Keep the content as plain text for markdown
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }
  
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Gradient background
      }}
    >
      <Paper 
        elevation={10} 
        style={{ 
          padding: '30px', 
          borderRadius: '20px', // Increased border radius
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', // Enhanced shadow
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Apprentease Support Bot
        </Typography>
        <Stack
          direction={'column'}
          width="800px"
          height="700px"
          spacing={3}
        >
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === 'assistant' ? 'flex-start' : 'flex-end'
                }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant' ? 'primary.main' : 'secondary.main'
                  }
                  color="white"
                  borderRadius={16}
                  p={3} // Adjusted padding for better text spacing
                  boxShadow={2}
                  sx={{
                    transition: 'transform 0.2s', // Add transition for hover effect
                    '&:hover': {
                      transform: 'scale(1.02)', // Slightly scale on hover
                    },
                    fontSize: '0.875rem',
                  }}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={'row'} spacing={2}>
            <TextField
              label="Enter your question"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              fullWidth
              variant="outlined"
              sx={{
                borderRadius: '10px', // Rounded corners for input
              }}
            />
            <Button 
              variant="contained" 
              onClick={sendMessage}
              disabled={isLoading}
              sx={{ 
                '&:hover': { bgcolor: 'secondary.dark' },
                borderRadius: '10px', // Rounded corners for button
              }} 
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}