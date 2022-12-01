import {
    ApolloClient,
    InMemoryCache,
    gql
} from "@apollo/client";

let client;
setupClient()

async function setupClient() {
    const isDev = await electron.getIsDev();
    const isStaging = await electron.getIsStaging();
    client = new ApolloClient({
        uri: isDev && isStaging === false ? 'https://publish-dev-vpighsmr70zxa92r9w.herokuapp.com/graphql'
            :
            isDev === false && isStaging === false ?
                'https://ecosystem-dashboard.herokuapp.com/graphql'
                :
                isDev === false && isStaging === true && 'https://staging-ecosystem-dashboard.herokuapp.com/graphql'
        ,
        cache: new InMemoryCache()
    });
}

export const GET_CORE_UNITS = gql`
    query getCoreUnits {
     coreUnits {
        id
        code
        name
  }
}
`;

export async function getCoreUnits() {
    const cus = client.query({
        query: gql`
            query getCoreUnits {
                coreUnits {
                    id
                    code
                    name
                    shortCode
                 }
            }
            `
    });
    return cus;
}

export const GET_CORE_UNIT = gql`
    query getCoreUnit($filter: CoreUnitFilter) {
     coreUnit(filter: $filter) {
        id
        code
        name
  }
}
`;

export const getCoreUnit = async (id) => {
    try {
        const cu = client.query({
            query: gql`
                query getCoreUnit($filter: CoreUnitFilter){
                    coreUnit(filter: $filter) {
                        id
                        code
                        name
                        shortCode
                    }
                }
            `,
            variables: {
                filter: {
                    id: parseFloat(id)
                }
            }
        });

        return cu;
    } catch (error) {
        console.error(error)
    }
}

export const getBudgetSatementInfo = async (cuId) => {
    try {
        const budgetStatements = client.query({
            query: gql`
                query BudgetStatement($filter: BudgetStatementFilter) {
                    budgetStatement(filter: $filter) {
                        id
                        cuId
                        month
                        budgetStatementWallet {
                            id
                            name
                            address
                            budgetStatementLineItem {
                                id
                                budgetStatementWalletId
                                month
                                position
                                group
                                budgetCategory
                                forecast
                                actual
                                comments
                            }
                        }
                    }
                }
            `,
            variables: {
                filter: {
                    cuId
                }
            },
            fetchPolicy: 'no-cache'
        });
        return budgetStatements;
    } catch (error) {
        console.error(error)
    }
}


export const addBudgetStatements = async (budgetStatements, authToken) => {
    try {
        const result = await client.mutate({
            mutation: gql`
                mutation BudgetStatementsBatchAdd($input: [BudgetStatementBatchAddInput]) {
                    budgetStatementsBatchAdd(input: $input) {
                            id
                            cuId
                            month
                            budgetStatementWallet {
                                id
                                name
                                address
                            }
                    }
                }
            `,
            variables: {
                input: budgetStatements
            },
            fetchPolicy: 'no-cache',
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            }
        })
        return result;
    } catch (error) {
        console.error(error)
    }

}

export const deleteBudgetLineItems = async (lineItems, authToken) => {
    try {
        const result = await client.mutate({
            mutation: gql`
                mutation Mutation($input: [LineItemsBatchDeleteInput]) {
                    budgetLineItemsBatchDelete(input: $input) {
                        id
                    }
                }
            `,
            variables: {
                input: lineItems
            },
            fetchPolicy: 'no-cache',
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            }
        })
        return result;
    } catch (error) {
        console.error(error)
    }
}

export const updateBudgetLineItem = async (lineItem, authToken) => {
    try {
        const result = await client.mutate({
            mutation: gql`
                mutation BudgetLineItemUpdate($input: LineItemUpdateInput) {
                    budgetLineItemUpdate(input: $input) {
                        id
                        budgetCategory
                    }
                }
            `,
            variables: {
                input: lineItem
            },
            fetchPolicy: 'no-cache',
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            }
        })
        return result;
    } catch (error) {
        console.error(error)
    }
}

export const updateBudgetLineItems = async (lineItems, authToken) => {
    try {
        const result = await client.mutate({
            mutation: gql`
                mutation BudgetLineItemsBatchUpdate($input: [LineItemsBatchUpdateInput]) {
                    budgetLineItemsBatchUpdate(input: $input) {
                        id
                        comments
                        budgetCategory
                    }
                }
            `,
            variables: {
                input: lineItems
            },
            fetchPolicy: 'no-cache',
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            }
        })
        return result;
    } catch (error) {
        console.error(error)
    }
}

export const addBudgetStatementWallets = async (budgetStatementWallets, authToken) => {
    try {
        const result = await client.mutate({
            mutation: gql`
                mutation BudgetStatementWalletBatchAdd($input: [BudgetStatementWalletBatchAddInput]) {
                    budgetStatementWalletBatchAdd(input: $input) {
                        id
                        budgetStatementId
                    }
                }
            `,
            variables: {
                input: budgetStatementWallets
            },
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            }
        });
        return result;

    } catch (error) {
        console.error(error)
    }
};

export const getBudgetLineItems = async (walletId, month) => {
    try {
        if (walletId !== undefined && month !== undefined) {
            const result = client.query({
                query: gql`
                    query BudgetStatementLineItem($filter: BudgetStatementLineItemFilter) {
                        budgetStatementLineItem(filter: $filter) {
                            id
                            budgetStatementWalletId
                            month
                            position
                            group
                            budgetCategory
                            forecast
                            actual
                            comments
                        }
                    }
                `,
                variables: {
                    filter: {
                        budgetStatementWalletId: parseFloat(walletId),
                        month: month
                    }
                },
                fetchPolicy: 'no-cache'
            });
            return result;
        }
        if (walletId !== undefined) {
            const result = client.query({
                query: gql`
                    query BudgetStatementLineItem($filter: BudgetStatementLineItemFilter) {
                        budgetStatementLineItem(filter: $filter) {
                            id
                            budgetStatementWalletId
                            month
                            position
                            group
                            budgetCategory
                            forecast
                            actual
                            comments
                        }
                    }
                `,
                variables: {
                    filter: {
                        budgetStatementWalletId: parseFloat(walletId),
                    }
                },
                fetchPolicy: 'no-cache'
            });
            return result;
        }
    } catch (error) {
        console.error(error)
    }
}

export const getBudgetToolVersion = async () => {
    try {
        const result = client.query({
            query: gql`
                query latestQuery {
                    latestBudgetToolVersion {
                        id
                        version
                        link
                }
            }
            `
        });
        return result;
    } catch (error) {
        console.error(object)
    }
}

export const getFte = async (budgetStatementId) => {
    try {
        const result = client.query({
            query: gql`
                query fte($filter: BudgetStatementFTEsFilter) {
                    budgetStatementFTE(filter: $filter) {
                        id
                        budgetStatementId
                        month
                        ftes
                }
             }
            `,
            variables: {
                filter: {
                    budgetStatementId
                }
            },
            fetchPolicy: 'no-cache'
        });
        return result;
    } catch (error) {
        console.error(error);
    }
};

export const getBudgetStatementComments = async (budgetStatementId) => {
    try {
        const result = client.query({
            query: gql`
                query BudgetStatementComments($filter: BudgetStatementCommentFilter) {
                    budgetStatementComment(filter: $filter) {
                        id
                        budgetStatementId
                        timestamp
                        comment
                        commentAuthor {
                        id
                        name
                        }
                    }
                }
            `,
            variables: {
                filter: {
                    budgetStatementId
                }
            },
            fetchPolicy: 'no-cache'
        });
        return result;
    } catch (error) {
        console.error(error)
    }
};

export const createBudgetStatementComment = async (comment, authToken) => {
    try {
        const result = client.mutate({
            mutation: gql`
                mutation BudgetStatementCommentCreate($input: BudgetStatementCommentInput) {
                    budgetStatementCommentCreate(input: $input) {
                        id
                        budgetStatementId
                        timestamp
                        comment
                        commentAuthor {
                        id
                        name
                    }
                }
            }
            `,
            variables: {
                input: comment
            },
            context: {
                headers: {
                    authorization: `Bearer ${authToken}`
                }
            }
        });
        return result

    } catch (error) {
        console.error(error)
    }
};