import { apiEndpoints } from '@/api/apiEndpoints'
import { axiosInstance } from '@/infrastructure/http/axios-instance'

export type SearchResultItem = {
  _id: string
  chatId: string | { _id: string; title?: string }
  role: 'user' | 'assistant'
  versions: Array<{
    content: string
  }>
  currentVersionIndex: number
  createdAt: string
}

type SearchResponse = {
  success: boolean
  message: string
  data: SearchResultItem[]
}

export const searchService = {
  search: async (query: string): Promise<SearchResultItem[]> => {
    const response = await axiosInstance.get<SearchResponse>(
      apiEndpoints.search.search,
      { params: { query } }
    )
    return response.data.data
  },
}
