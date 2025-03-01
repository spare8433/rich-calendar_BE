<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h1 align="center">Rich Calendar API Server</h1>
  <p align="center">
    <p><a href="https://github.com/spare8433/rich-calendar_FE">Rich Calendar</a> API 서버</p>
    <a href="https://github.com/spare8433/rich-calendar_BE/issues">Report Bug</a>
    &middot;
    <a href="https://github.com/spare8433/rich-calendar_BE/issues">Request Feature</a>
  </p>
</div>

<br />

<!-- TABLE OF CONTENTS -->
<details open>
  <summary>Table of Contents</summary>
  <br />
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#api-endpoints">API-Endpoints</a>
      <ul>
        <li><a href="#인증-관련(api/auth/)">인증 관련(api/auth/)</a></li>
        <li><a href="#사용자-관련(api/users/)">사용자 관련(api/users/)</a></li>
        <li><a href="#스케줄-관련(api/schedules/)">스케줄 관련(api/schedules/)</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<br />

<!-- ABOUT THE PROJECT -->

## About The Project

Prisma 를 활용하여 DB 모델 및 변경 쿼리를 구성하고 Next.js Route Handlers 를 활용하여 간결하면서도 효율적인 API 서버를 구현했습니다.

<p align="right">(<a href="#readme-top">맨 위로</a>)</p>

### Built With

<br />

- [![Next][Next.js]][Next-url]
- [![TypeScript][TypeScript]][TypeScript-url]
- [![Prisma][Prisma]][Prisma-url]

<p align="right">(<a href="#readme-top">맨 위로</a>)</p>

<br />

## API Endpoints

<br>

<h3 id="인증-관련(api/auth/)">인증 관련(api/auth/)</h3>

<br>

|                  기능                   | Method  |              Endpoint              |
| :-------------------------------------: | :-----: | :--------------------------------: |
|                 로그인                  | `POST`  |          `api/auth/login`          |
|                회원가입                 | `POST`  |         `api/auth/signup`          |
|   이메일 등록 인증 코드 이메일로 발송   | `POST`  |     `api/auth/email/send-code`     |
|       이메일 등록 인증 코드 검증        | `POST`  |    `api/auth/email/verify-code`    |
|             비밀번호 재설정             | `PATCH` |        `api/auth/password`         |
| 비밀번호 재설정 인증 코드 이메일로 발송 | `POST`  |   `api/auth/password/send-code`    |
|     비밀번호 재설정 인증 코드 검증      | `POST`  |  `api/auth/password/verify-code`   |
|         사용자 아이디 중복 확인         | `POST`  | `api/auth/username/check-username` |
|           사용자 아이디 찾기            | `POST`  | `api/auth/username/find-username`  |

<br><br>

<h3 id="사용자-관련(api/users/)">사용자 관련(api/users/)</h3>

<br>

|         기능          |  Method  |        Endpoint        |
| :-------------------: | :------: | :--------------------: |
| 사용자 본인 정보 조회 |  `POST`  |   `api/auth/user/me`   |
| 사용자 본인 회원 탈퇴 | `DELETE` | `api/auth/user/me/:id` |

<br><br>

<h3 id="스케줄-관련(api/schedules/)">스케줄 관련(api/schedules/)</h3>

<br>

|           기능            |  Method  |           Endpoint            |
| :-----------------------: | :------: | :---------------------------: |
|        스케줄 생성        |  `POST`  |        `api/schedules`        |
|     특정 스케줄 조회      |  `GET`   |      `api/schedules/:id`      |
|   특정 스케줄 업데이트    |  `PUT`   |      `api/schedules/:id`      |
|     특정 스케줄 삭제      | `DELETE` |      `api/schedules/:id`      |
|   캘린더 일정 목록 조회   |  `GET`   |   `api/schedules/calendars`   |
|   특정 캘린더 일정 수정   | `PATCH`  | `api/schedules/calendars/:id` |
|    요약 일정 목록 조회    |  `GET`   |    `api/schedules/summary`    |
|     스케줄 태크 생성      |  `POST`  |     `api/schedules/tags`      |
|   특정 스케줄 태크 조회   |  `GET`   |   `api/schedules/tags/:id`    |
| 특정 스케줄 태크 업데이트 |  `PUT`   |   `api/schedules/tags/:id`    |
|   특정 스케줄 태크 삭제   | `DELETE` |   `api/schedules/tags/:id`    |

<br>

## Contact

<b>Email</b> : byeongchan8433@gmail.com

<b>Blog</b> : https://spare8433.tistory.com

<b>GitHub</b> : https://github.com/spare8433

<br />

<p align="right">(<a href="#readme-top">맨 위로</a>)</p>

[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Prisma]: https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=fff&style=for-the-badge
[Prisma-url]: https://www.prisma.io/
