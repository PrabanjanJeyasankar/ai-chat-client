import { apiEndpoints } from '@/api/apiEndpoints'
import { axiosInstance } from '@/lib/axiosInstance'

export type SearchResultItem = {
  _id: string
  messageId?: string
  chatId: string | { _id: string; title: string }
  content: string
  role: string
  versions?: { content: string; role: string; createdAt: string }[]
  createdAt: string
  chatTitle?: string
  currentVersionIndex: number
}

export type SearchResponse = {
  success: boolean
  message: string
  data: {
    results: SearchResultItem[]
  }
}

async function searchMessages(query: string): Promise<SearchResultItem[]> {
  const response = await axiosInstance.get<SearchResponse>(
    apiEndpoints.search.search,
    {
      params: { q: query },
    }
  )

  return response.data.data.results
}

export const searchService = {
  searchMessages,
}
