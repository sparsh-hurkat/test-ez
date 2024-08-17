"use client";
import { Box, Grid, TextField, Typography } from "@mui/material";
import { useChat } from "ai/react";
import SendIcon from "@mui/icons-material/Send";

export default function Home() {
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    append,
  } = useChat();
  return (
    <main>
      <Grid>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", textAlign: "center" }}
        >
          Topic
          <TextField
            name="topic"
            value={input}
            onChange={handleInputChange}
            // sx={classes.textfield}
            placeholder="Ask me anything"
            // InputProps={{
            //   endAdornment: <SendIcon onClick={handleSubmit} />,
            // }}
            autoComplete="off"
          />
          No. of questions
          <TextField
            name="no_of_questions"
            value={input}
            onChange={handleInputChange}
            // sx={classes.textfield}
            placeholder="Ask me anything"
            InputProps={{
              endAdornment: <SendIcon onClick={handleSubmit} />,
            }}
            autoComplete="off"
          />
        </Box>
        <Typography>
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === "user" ? "User: " : "AI: "}
              {message.content}
            </div>
          ))}
        </Typography>
      </Grid>
    </main>
  );
}
