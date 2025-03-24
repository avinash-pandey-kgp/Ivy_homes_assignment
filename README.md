# Autocomplete API Extractor

## API Versions and Constraints
Through systematic exploration , got 3 different versions of api , each of which had following characterstics :
### Version v1
1. Maximum length of strings: 10
2. Maximum number of requests per minute: 100
3. Maximum size of array of strings: 10
4. Strings only contained chars a to z
5. Returned strings were lexicographically sorted

### Version v2
1. Maximum length of strings: 10
2. Maximum number of requests per minute: 50
3. Maximum size of array of strings: 12
4. Strings only contained chars 0 to 9 and a to z
5. Returned strings were lexicographically sorted

### Version v3
1. Maximum length of strings: 10
2. Maximum number of requests per minute: 80
3. Maximum size of array of strings: 15
4. Strings only contained chars ' ', '.', '+', '-', 0 to 9 and a to z
5. Returned strings were lexicographically sorted
6. API was not considering trailing ' '(space) or '+' for response

## Solution Approach

### Version v1
1. Maintain 2 strings, s1 and s2. Initialize s1 = 'a' and s2='\0'. s1 will indicate the prefix till which we have explored the API, and s2 will indicate the last string that was put in text file.
2. Since only 100 requests are allowed per minute, so each request should be made at approx 60000/100 i.e. 610 ms. So implement a sleep function, that will cause the js thread to remain hung for a given amount of time(610ms).
3. Insert only those strings in text file that are lexicographically greater than s2.
4. If the size of response array is less than 10, it means there are no more names with prefix as s1, so increment the last character of s1 (if last char is z then increment the last most char that is not z) and set s2 to '\0'.
5. If the size of response array is 10, it means there may be more names with prefix s1, set s1 to substring of last result string with length as (s1.length + 1), and set s2 to last result string.
6. Keep repeating this process, until s1 becomes null.

### Version v2
Key changes from v1:
1. s1 starts with '0'.
2. Sync sleep has duration of 60000/50 or approx 1220ms.
3. Conditioning length of array becomes 12 instead of 10.
4. Chars from 0 to 9 are also included.

### Version v3
1. Sync sleep has duration of 60000/80 or approx 760ms.
2. Conditioning length of array becomes 15.
3. ' ', '.', '-' and '+' are also included.
4. Do not send any request for queries which have trailing ' ' or '+'.
5. s1 starts from '0'.

Additionally, if server still gives error for too many requests, we use try catch block. In case of error, we wait for some more time (say 1 min).

## Results
- Made 12947 requests and got 18632 distinct names from v1
- Made 3122 requests and got 13730 distinct names from v2
- Got 12517 distinct names from v3
