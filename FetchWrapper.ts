export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function performFetch(url: string, method: Method = "GET", body: any = null): Promise<any> {
    // Prepare request

    const options: RequestInit = {
        method: method,
        headers: {}
    };
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(body);
        options.headers = { 'Content-Type': 'application/json' };
    }

    // Send request and read response

    let response: Response;
    try {
        response = await fetch(url, options);
    }
    catch (error) {
        throw new Error("Network error occurred");
    }

    // Parse result JSON if available

    const contentType = response.headers.get('Content-Type');
    let result;
    if (contentType && (contentType.includes('application/json') || contentType.includes('application/problem+json')))
        result = await response.json();

    // Handle errors (status code not in 200-299 range)

    if (!response.ok)
        throw new Error(result?.message || `HTTP error: ${response.statusText || response.status}`);

    // Return successful result

    return result;
}
