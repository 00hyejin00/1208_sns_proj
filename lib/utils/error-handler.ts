/**
 * @file lib/utils/error-handler.ts
 * @description 에러 핸들링 유틸리티 함수
 *
 * API 에러와 네트워크 에러를 일관되게 처리하고,
 * 사용자 친화적인 에러 메시지를 제공합니다.
 */

/**
 * 에러 타입 정의
 */
export type ErrorType =
  | "NETWORK_ERROR"
  | "AUTH_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
}

/**
 * 네트워크 에러인지 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("Network") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("ERR_NETWORK")
    );
  }
  return false;
}

/**
 * 에러를 사용자 친화적인 메시지로 변환
 */
export function getErrorMessage(error: unknown): string {
  // 네트워크 에러
  if (isNetworkError(error)) {
    return "네트워크 연결을 확인해주세요. 인터넷 연결이 불안정할 수 있습니다.";
  }

  // Error 객체인 경우
  if (error instanceof Error) {
    const message = error.message;

    // 인증 에러
    if (message.includes("Unauthorized") || message.includes("인증")) {
      return "로그인이 필요합니다. 다시 로그인해주세요.";
    }

    // 권한 에러
    if (message.includes("Forbidden") || message.includes("권한")) {
      return "이 작업을 수행할 권한이 없습니다.";
    }

    // 찾을 수 없음
    if (message.includes("Not Found") || message.includes("찾을 수 없")) {
      return "요청한 내용을 찾을 수 없습니다.";
    }

    // 서버 에러
    if (message.includes("Internal Server Error") || message.includes("서버 오류")) {
      return "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }

    // 기타 에러 메시지 반환
    return message;
  }

  // 알 수 없는 에러
  return "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

/**
 * 에러를 AppError 객체로 변환
 */
export function normalizeError(error: unknown): AppError {
  if (isNetworkError(error)) {
    return {
      type: "NETWORK_ERROR",
      message: getErrorMessage(error),
      originalError: error,
    };
  }

  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("Unauthorized") || message.includes("인증")) {
      return {
        type: "AUTH_ERROR",
        message: getErrorMessage(error),
        originalError: error,
      };
    }

    if (message.includes("Not Found") || message.includes("찾을 수 없")) {
      return {
        type: "NOT_FOUND",
        message: getErrorMessage(error),
        originalError: error,
      };
    }

    if (
      message.includes("Internal Server Error") ||
      message.includes("서버 오류") ||
      message.includes("500")
    ) {
      return {
        type: "SERVER_ERROR",
        message: getErrorMessage(error),
        originalError: error,
      };
    }
  }

  return {
    type: "UNKNOWN_ERROR",
    message: getErrorMessage(error),
    originalError: error,
  };
}

/**
 * API 응답에서 에러 추출
 */
export async function handleApiResponse<T>(
  response: Response
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  // 네트워크 에러 확인
  if (!response.ok) {
    // JSON 응답 시도
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        const errorMessage = data.error || `서버 오류 (${response.status})`;
        return { success: false, error: errorMessage };
      }
    } catch {
      // JSON 파싱 실패 시 상태 코드 기반 메시지
      const statusMessages: Record<number, string> = {
        400: "잘못된 요청입니다.",
        401: "로그인이 필요합니다.",
        403: "권한이 없습니다.",
        404: "요청한 내용을 찾을 수 없습니다.",
        500: "서버에 일시적인 문제가 발생했습니다.",
        503: "서비스를 일시적으로 사용할 수 없습니다.",
      };

      const errorMessage =
        statusMessages[response.status] || `서버 오류가 발생했습니다. (${response.status})`;
      return { success: false, error: errorMessage };
    }
  }

  // 성공 응답 파싱
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonData = await response.json();
      
      // API 응답이 { success: true, data: T } 형식인지 확인
      if (jsonData && typeof jsonData === "object" && "success" in jsonData && "data" in jsonData) {
        if (jsonData.success && jsonData.data !== undefined) {
          return { success: true, data: jsonData.data as T };
        } else if (!jsonData.success && jsonData.error) {
          return { success: false, error: jsonData.error };
        }
      }
      
      // 직접 데이터인 경우 (응답이 data 필드 없이 바로 반환되는 경우)
      return { success: true, data: jsonData as T };
    }

    // JSON이 아닌 경우
    return {
      success: false,
      error: "서버 응답 형식이 올바르지 않습니다.",
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

