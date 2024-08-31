'use client'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline,
  Box,
  Stack,
  TextField,
  Typography,
  Button
} from "@mui/material";
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Person as PersonIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import { useState } from "react";


export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hola! I'm the Rate My Professor support bot. How may I assist you today?`,
    },
  ])
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let result = ''

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);

          setLoading(false);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
        return reader.read().then(processText)
      })
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Create a theme instance based on the darkMode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Navbar */}
      <Box
        width="100%"
        minHeight="100px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding={2}
        overflow="hidden"
        bgcolor="background.paper"
        boxShadow={1}
      >
        <Typography variant="h3" color="text.primary" pl={3}>Rate your Professor</Typography>
        <IconButton onClick={toggleDarkMode}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      {/* Personal Info and Chat component */}
      <Box
        width="100vw"
        height="90vh"
        display="flex"
        sx={{
          flexDirection: {
            xs: 'column', // Column layout for extra-small screens (mobile)
            sm: 'column', // Column layout for small screens (tablets)
            md: 'row',    // Row layout for medium screens and above (desktops)
          },
          gap: {
            xs: 2,
            sm: 5,
            md: 10,
          },
        }}
        justifyContent="center"
        alignItems="center"
      >
        {/* Chat component */}
        <Stack
          width="700px"
          maxWidth="80%"
          height="700px"
          direction="column"
          border={`2px solid ${theme.palette.divider}`}
          boxShadow={20}
          p={2}
          spacing={3}
        >
          {loading && <LinearProgress />}
          <Stack
            direction="column"
            flexGrow={1}
            spacing={1}
            overflow="auto"
            maxHeight="100%"
          >
            {
              messages.map((msg, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={
                    msg.role === 'assistant' ? "flex-start" : "flex-end"
                  }
                  gap={1}
                >
                  {msg.role === 'assistant' ? (
                    <>
                      <Avatar alt="AI agent" src="/futuristic.png" />
                      <Box
                        bgcolor={
                          theme.palette.mode === 'dark'
                            ? 'primary.dark'
                            : 'primary.light'
                        }
                        color="white"
                        borderRadius={3}
                        p={1}
                        maxWidth="80%"
                        overflow="visible"
                        textOverflow="clip"
                        whiteSpace="normal"
                      >
                        {msg.content}
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box
                        bgcolor={
                          theme.palette.mode === 'dark'
                            ? 'secondary.dark'
                            : 'secondary.light'
                        }
                        color="white"
                        borderRadius={3}
                        p={1}
                        maxWidth="80%"
                        overflow="visible"
                        textOverflow="clip"
                        whiteSpace="normal"
                      >
                        {msg.content}
                      </Box>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </>
                  )}
                </Box>
              ))
            }
          </Stack>
          <Stack
            direction="row"
            spacing={2}
          >
            <TextField
              label="Message AI"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button type="submit" variant="contained" endIcon={<SendIcon />} onClick={sendMessage} disabled={!message.trim()}>SEND</Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}