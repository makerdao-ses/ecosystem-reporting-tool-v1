import React, { useState, useEffect } from 'react';
import { Card, Textarea, Label, Input, Grid, Text, Button, Spinner, Box } from "theme-ui";
import { useSnackbar } from 'notistack';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';
import { useSelector } from 'react-redux';
import { getBudgetStatementComments, createBudgetStatementComment, getUsers } from '../../api/graphql';

export default function BudgetStatementComment({ budgetStatementId, users }) {

    const userFromStore = useSelector(store => store.user);

    const [inputText, setInputText] = useState('');
    const [comments, setComments] = useState([])
    const [preview, setPreview] = useState(false)

    const { enqueueSnackbar } = useSnackbar()
    useEffect(() => {

        getComments()
    }, [budgetStatementId])

    const getComments = async () => {
        if (budgetStatementId !== undefined) {
            try {
                const result = await getBudgetStatementComments(budgetStatementId);
                setComments(result.data.budgetStatementComment)
                enqueueSnackbar(`Comments fetched`, { variant: 'success' })
            } catch (error) {
                enqueueSnackbar(error, { variant: 'error' })
            }
        }
    };

    const handleSubmit = async () => {
        try {
            const commentObj = {
                budgetStatementId,
                comment: inputText,
                commentAuthorId: userFromStore.id
            }
            const result = await createBudgetStatementComment(commentObj, userFromStore.authToken)
            setComments(prev => [...prev, result.data.budgetStatementCommentCreate[0]])
            setInputText('')
            setPreview(false)
            enqueueSnackbar('Added new expense comment', { variant: 'success' })

        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' })
        }
    }

    const handlePreview = () => {
        setPreview(!preview)
    }


    return (
        <>{comments.length < 1 ?
            <Card sx={{ mt: '10px', textAlign: 'center' }}>
                <Text>No comments added yet, be the first below!</Text>
            </Card>
            :
            <Card sx={{ height: '150px', mt: '10px', overflowY: 'scroll', scrollBehaviour: "smooth" }} >
                {comments.map((obj, key) => {
                    return (
                        <Box key={key} sx={{ borderBottom: '1px solid grey', fontSize: '15px' }}>
                            <Grid
                                columns={[2, '2fr 0.1fr']}
                            >
                                <Text sx={{ fontWeight: 'bold' }}>{obj.author.username} wrote on {`${obj.timestamp?.substring(0, 10)} 
                                ${obj.timestamp?.substring(11, 16)} UTC`} - {`${obj.status}`}</Text>
                                {/* <Text sx={{position: 'right', color: 'red', cursor: 'pointer'}}>Delete</Text> */}
                            </Grid>
                            <ReactMarkdown children={obj.comment} remarkPlugins={[remarkGfm]} />
                        </Box>
                    )
                })
                }
            </Card>
        }
            <Card sx={{ mt: '5px' }}>
                {preview ?
                    <div style={{ fontSize: '15px', border: '1px solid #DCDCDC', paddingLeft: '4px' }}>
                        <ReactMarkdown children={inputText} remarkPlugins={[remarkGfm]} />
                    </div>
                    :
                    <Textarea rows={4}
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                    />
                }
                <Grid
                    columns={2}
                    sx={{ mt: '5px' }}
                >
                    {inputText !== '' ?
                        <Button
                            sx={{ width: '100px' }}
                            variant="smallOutline"
                            onClick={handlePreview}
                        >Preview</Button>
                        : <div></div>
                    }
                    <Button
                        variant="smallOutline"
                        onClick={handleSubmit}
                        disabled={!inputText}
                    >Submit</Button>
                </Grid>
            </Card>
        </>
    )
}