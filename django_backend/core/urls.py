from django.urls import path, include
from rest_framework.routers import DefaultRouter
# from . import views
from .auth_view import GitHubLoginView, GitHubCallbackView, GitHubExchangeAuthTokenView, GitHubLoginRedirectView
from .admin_view import AdminStatsView, AdminUserListView, AdminUserUpdateView
from .webhook_view import github_webhook
from .user_view import CurrentUserView, UserRepositoriesView, UserOrganizationsView
from .repository_view import RepositoryViewSet
from .pr_view import PullRequestViewSet
from .commit_view import CommitViewSet
from .review_view import ReviewViewSet
from .llmusage_view import LLMUsageViewSet
from .thread_view import ThreadViewSet
router = DefaultRouter()
# # Register endpoints in FastAPI router order
# router.register(r'repositories', views.RepositoryViewSet, basename='repository')
# router.register(r'pull-requests', views.PullRequestViewSet, basename='pullrequest')
# router.register(r'commits', views.CommitViewSet, basename='commit')
# router.register(r'reviews', views.ReviewViewSet, basename='review')
# router.register(r'llm-usage', views.LLMUsageViewSet, basename='llmusage')
# router.register(r'threads', views.ThreadViewSet, basename='thread')
# # router.register(r'comments', views.CommentViewSet, basename='comment')
# # router.register(r'review-feedback', views.ReviewFeedbackViewSet, basename='reviewfeedback')
# # Optionally: router.register(r'admin', views.AdminViewSet, basename='admin')

# urlpatterns = [
#     # Auth endpoints
#     path('auth/github/login/', views.GitHubLoginView.as_view(), name='github_login'),
#     path('auth/github/callback/', views.GitHubCallbackView.as_view(), name='github_callback'),
#     # path('auth/github/', views.GitHubDirectAuthView.as_view(), name='github_direct_auth'), # This was commented out, ensure it's needed or remove
#     path('auth/github/exchange/', views.GitHubExchangeAuthTokenView.as_view(), name='github_exchange_token'), # Added for explicit token exchange

#     # User endpoints are now part of UserViewSet, accessed via router
#     path('user/', views.CurrentUserView.as_view(), name='current_user'), # Replaced by users/me
#     path('user/repos/', views.UserRepositoriesView.as_view(), name='user_repositories'), # Replaced by users/repos
#     path('user/organizations/', views.UserOrganizationsView.as_view(), name='user_organizations'), # Replaced by users/organizations

#     # Repository endpoints (router)
#     path('', include(router.urls)),

#     # Webhook endpoints
#     # path('webhook/', views.GitHubWebhookView.as_view(), name='github_webhook'), # Generic webhook handler
#     path('webhook/github/', views.github_webhook, name='github-webhook'),
#     # path('webhook/github/comment/', views.GitHubCommentView.as_view(), name='github_comment'), # This seems specific, ensure it's needed or covered by generic webhook

#     # Admin endpoints
#     path('admin/stats/', views.AdminStatsView.as_view(), name='admin_stats'),
#     path('admin/users/', views.AdminUserListView.as_view(), name='admin_list_users'),
#     path('admin/users/<int:user_id>/', views.AdminUserUpdateView.as_view(), name='admin_update_user'),
# ]
# Register endpoints in FastAPI router order
router.register(r'repositories', RepositoryViewSet, basename='repository')
router.register(r'pull-requests', PullRequestViewSet, basename='pullrequest')
router.register(r'commits', CommitViewSet, basename='commit')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'llm-usage', LLMUsageViewSet, basename='llmusage')
router.register(r'threads', ThreadViewSet, basename='thread')
# router.register(r'comments', views.CommentViewSet, basename='comment')
# router.register(r'review-feedback', views.ReviewFeedbackViewSet, basename='reviewfeedback')
# Optionally: router.register(r'admin', views.AdminViewSet, basename='admin')

urlpatterns = [
    # Auth endpoints
    path('auth/github/login/', GitHubLoginView.as_view(), name='github_login'),
    path('auth/github/callback/', GitHubCallbackView.as_view(), name='github_callback'),
    # path('auth/github/', views.GitHubDirectAuthView.as_view(), name='github_direct_auth'), # This was commented out, ensure it's needed or remove
    path('auth/github/exchange/', GitHubExchangeAuthTokenView.as_view(), name='github_exchange_token'), # Added for explicit token exchange

    # User endpoints are now part of UserViewSet, accessed via router
    path('user/', CurrentUserView.as_view(), name='current_user'), # Replaced by users/me
    path('user/repos/', UserRepositoriesView.as_view(), name='user_repositories'), # Replaced by users/repos
    path('user/organizations/', UserOrganizationsView.as_view(), name='user_organizations'), # Replaced by users/organizations

    # Repository, pr, commit, reviews, llm-usage and threads endpoints (router)
    path('', include(router.urls)),

    path('webhook/github/', github_webhook, name='github-webhook'),

    # Admin endpoints
    path('admin/stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_list_users'),
    path('admin/users/<int:user_id>/', AdminUserUpdateView.as_view(), name='admin_update_user'),
]