import React, { useState, useEffect } from 'react';
import { Card, Textarea, Select, Grid, Text, Button, Box } from "theme-ui";
import { useSnackbar } from 'notistack';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';
import { useSelector } from 'react-redux';
import { getBudgetStatementComments, createBudgetStatementComment, getTeam } from '../../api/graphql';

export default function BudgetStatementComment({ budgetStatementId, users }) {

    const userFromStore = useSelector(store => store.user);

    const [inputText, setInputText] = useState('');
    const [comments, setComments] = useState([])
    const [preview, setPreview] = useState(false)
    const [withAuditor, setWithAuditor] = useState(false);
    const [status, setStatus] = useState('Draft');
    const [editStatus, setEditStatus] = useState(false);

    const { enqueueSnackbar } = useSnackbar()
    useEffect(() => {
        getComments()
        getAuditors()
    }, [budgetStatementId])

    const getComments = async () => {
        if (budgetStatementId !== undefined) {
            try {
                const result = await getBudgetStatementComments(budgetStatementId);
                const fetchedComments = result.data.budgetStatementComments;
                setComments(fetchedComments)
                if (fetchedComments.length < 1) {
                    setStatus('Draft')
                } else {
                    setStatus(fetchedComments[fetchedComments.length - 1].status)
                }
                enqueueSnackbar(`Comments fetched`, { variant: 'success' })
            } catch (error) {
                enqueueSnackbar(error, { variant: 'error' })
            }
        }
    };
    const getAuditors = async () => {
        if (userFromStore.cuId) {
            const cu = await getTeam(userFromStore.cuId);
            if (cu.data.teams[0].auditors.length > 0) {
                setWithAuditor(true)
            }
        }
        // Assuming that Delegates have auditors. 
        if (userFromStore.cuId === null) {
            setWithAuditor(true);
        }
    }
    const handleSubmit = async () => {
        try {
            const commentObj = {
                budgetStatementId,
                comment: inputText,
                commentAuthorId: userFromStore.id,
                status
            }
            const result = await createBudgetStatementComment(commentObj, userFromStore.authToken)
            setComments(prev => [...prev, result.data.budgetStatementCommentCreate[0]])
            getComments()
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

    const handleSelect = (value) => {
        setStatus(value);
    }

    const handleInputText = (value) => {
        setInputText(value)
        setEditStatus(true)
    }

    const handleEditStatus = () => {
        setStatus('Draft')
        setEditStatus(prevStatus => {
            return !prevStatus
        })
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
                                ${obj.timestamp?.substring(11, 16)} UTC`} - {`${obj.status ? obj.status : status}`}</Text>
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
                        onChange={e => handleInputText(e.target.value)}
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
                    <div>
                        <Grid
                            columns={3}
                        >
                            <Button
                                variant="smallOutline"
                                onClick={handleEditStatus}
                            > Set status </Button>
                            <Select disabled={!editStatus} size={'small'} onChange={e => handleSelect(e.target.value)} value={status}>
                                <option>Draft</option>
                                {
                                    withAuditor ?
                                        <option>Review</option>
                                        :
                                        <option>Final</option>
                                }
                            </Select>
                            <Button
                                variant="smallOutline"
                                onClick={handleSubmit}
                                disabled={!editStatus}
                            >Submit</Button>
                        </Grid>
                    </div>
                </Grid>
            </Card>
        </>
    )
}